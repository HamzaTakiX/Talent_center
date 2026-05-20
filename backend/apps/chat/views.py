"""Contextual chat REST API."""

from __future__ import annotations

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts_et_roles.models import User
from apps.authentication.utils import envelope

from .models import Channel, Conversation, ConversationContext, Tag
from .permissions import conversations_for_user, user_can_access_conversation
from .serializers import (
    ChannelListSerializer,
    ConversationCreateSerializer,
    ConversationListSerializer,
    MessageCreateSerializer,
    MessageSerializer,
    SmartActionSerializer,
    TagSerializer,
)
from .services.conversation_service import (
    apply_smart_action,
    get_or_create_contextual_conversation,
    list_module_conversations,
)
from .services.message_service import list_messages, mark_read, send_message, toggle_reaction
from .services.realtime import publish_typing


class ChatChannelListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Channel.objects.filter(is_archived=False).order_by('code')
        ser = ChannelListSerializer(qs, many=True)
        return Response(envelope(True, 'Channels loaded', data=ser.data))


class ChatTagListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs = Tag.objects.all().order_by('code')
        ser = TagSerializer(qs, many=True)
        return Response(envelope(True, 'Tags loaded', data=ser.data))


class ChatConversationListView(APIView):
    """List contextual conversations for a module."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        module = request.query_params.get('module', '').strip()
        if not module:
            return Response(envelope(False, 'module query param required'), status=400)
        convs = list_module_conversations(
            request.user,
            module=module,
            context_kind=request.query_params.get('context_kind') or None,
            entity_type=request.query_params.get('entity_type') or None,
            urgency=request.query_params.get('urgency') or None,
            unread_only=request.query_params.get('unread') == '1',
            search=request.query_params.get('q', ''),
        )
        ser = ConversationListSerializer(convs, many=True, context={'request': request})
        payload = {'items': ser.data, 'total': len(ser.data)}
        return Response(envelope(True, 'Conversations loaded', data=payload))

    def post(self, request):
        ser = ConversationCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Invalid payload', errors=ser.errors), status=400)
        data = ser.validated_data
        participant_ids = data.pop('participant_user_ids', []) or []
        participants = list(User.objects.filter(pk__in=participant_ids))
        if request.user not in participants:
            participants.append(request.user)
        student = None
        sid = data.pop('student_user_id', None)
        if sid:
            student = User.objects.filter(pk=sid).first()
        snapshot = data.pop('context_snapshot_json', {})
        conv = get_or_create_contextual_conversation(
            **data,
            context_snapshot=snapshot,
            student_user=student,
            participant_users=participants,
            created_by=request.user,
        )
        out = ConversationListSerializer(conv, context={'request': request})
        return Response(envelope(True, 'Conversation ready', data=out.data), status=201)


class ChatConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id: int):
        conv = (
            conversations_for_user(request.user)
            .filter(pk=conversation_id)
            .select_related('context', 'context__student_user')
            .prefetch_related('participants__user')
            .first()
        )
        if not conv:
            return Response(envelope(False, 'Conversation not found'), status=404)
        ser = ConversationListSerializer(conv, context={'request': request})
        return Response(envelope(True, 'Conversation detail', data=ser.data))


class ChatMessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id: int):
        before_id = request.query_params.get('before_id')
        before = int(before_id) if before_id and before_id.isdigit() else None
        msgs = list_messages(request.user, conversation_id, before_id=before)
        ser = MessageSerializer(msgs, many=True, context={'request': request})
        return Response(envelope(True, 'Messages loaded', data={'items': ser.data}))

    def post(self, request, conversation_id: int):
        ser = MessageCreateSerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Invalid message', errors=ser.errors), status=400)
        payload = dict(ser.validated_data)
        metadata = payload.pop('metadata_json', {})
        tag_codes = payload.pop('tag_codes', [])
        msg = send_message(
            user=request.user,
            conversation_id=conversation_id,
            metadata=metadata,
            tag_codes=tag_codes,
            **payload,
        )
        if not msg:
            return Response(envelope(False, 'Cannot send message'), status=403)
        out = MessageSerializer(msg, context={'request': request})
        return Response(envelope(True, 'Message sent', data=out.data), status=201)


class ChatMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id: int):
        message_id = request.data.get('message_id')
        if not message_id:
            return Response(envelope(False, 'message_id required'), status=400)
        ok = mark_read(request.user, conversation_id, int(message_id))
        if not ok:
            return Response(envelope(False, 'Cannot mark read'), status=403)
        return Response(envelope(True, 'Marked read'))


class ChatTypingView(APIView):
    """WebSocket-ready typing indicator endpoint."""

    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id: int):
        is_typing = bool(request.data.get('is_typing', True))
        conv = Conversation.objects.filter(pk=conversation_id).first()
        if not conv or not user_can_access_conversation(request.user, conv):
            return Response(envelope(False, 'Forbidden'), status=403)
        publish_typing(conversation_id, request.user.pk, is_typing)
        return Response(envelope(True, 'Typing state updated'))


class ChatReactionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, message_id: int):
        emoji = (request.data.get('emoji_code') or 'thumbs_up').strip()
        result = toggle_reaction(request.user, message_id, emoji)
        if not result.get('ok'):
            return Response(envelope(False, 'Forbidden'), status=403)
        return Response(envelope(True, 'Reaction updated', data=result))


class ChatSmartActionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conversation_id: int):
        ser = SmartActionSerializer(data=request.data)
        if not ser.is_valid():
            return Response(envelope(False, 'Invalid action', errors=ser.errors), status=400)
        conv = (
            conversations_for_user(request.user)
            .filter(pk=conversation_id)
            .select_related('context')
            .first()
        )
        if not conv:
            return Response(envelope(False, 'Conversation not found'), status=404)
        try:
            result = apply_smart_action(
                conversation=conv,
                action_code=ser.validated_data['action_code'],
                actor=request.user,
                payload=ser.validated_data.get('payload'),
            )
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, 'Action applied', data=result))


class ChatInboxSummaryView(APIView):
    """Cross-module unread summary for enterprise inbox."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .services.message_service import unread_count_for_user

        modules = [c[0] for c in ConversationContext.Module.choices]
        summary = []
        for mod in modules:
            convs = list_module_conversations(request.user, module=mod)[:50]
            total_unread = sum(unread_count_for_user(request.user, c.pk) for c in convs)
            if convs or total_unread:
                summary.append({'module': mod, 'conversation_count': len(convs), 'unread': total_unread})
        return Response(envelope(True, 'Inbox summary', data={'modules': summary}))
