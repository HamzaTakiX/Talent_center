"""Admin & student-prep API views for announcements."""

import re

from django.db import models
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.pagination import paginate_queryset, paginated_payload
from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.authentication.utils import envelope

from .models import Announcement, AnnouncementAttachment, AnnouncementType, StudentAnnouncementAction
from .permissions import ANNOUNCEMENT_PERMISSIONS
from .serializers import (
    AnnouncementDetailSerializer,
    AnnouncementListSerializer,
    AnnouncementTypeSerializer,
    AnnouncementTypeWriteSerializer,
    AnnouncementWriteSerializer,
    PublicationLogSerializer,
)
from .services.analytics import (
    announcement_detail_analytics,
    dashboard_summary,
    engagement_dashboard,
    engagement_metrics,
    recommendation_performance,
    scheduled_dashboard_summary,
    top_announcements,
    type_distribution,
)
from .services.insights import generate_admin_insights
from .services.publication import (
    archive_announcement,
    cancel_schedule,
    duplicate_announcement,
    publish_announcement,
    schedule_announcement,
    unarchive_announcement,
    unpublish_announcement,
)
from .services.queries import announcements_list_queryset
from .services.chat_service import (
    get_or_create_announcement_conversation,
    send_announcement_message,
)
from .services.engagement import record_student_announcement_click
from .services.recommendation import recompute_scores_for_announcement
from .services.student_feed import get_student_announcement_detail, get_student_announcement_feed
from .services.student_bookmarks import (
    bookmark_flags_for_student,
    get_student_saved_announcement_feed,
    toggle_student_announcement_bookmark,
)
from .services.targeting import announcement_visible_to_student
from .services.seed_types import seed_announcement_types
from .services.targeting import estimate_audience_count


def _perm(permission_classes, required: str):
    class V(APIView):
        permission_classes = permission_classes
        required_permission = required
    return [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]


class AnnouncementDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = 'announcements.analytics'

    def get(self, request):
        return Response(envelope(
            True,
            'Dashboard loaded',
            data={
                'summary': dashboard_summary(),
                'scheduled': scheduled_dashboard_summary(),
                'engagement': engagement_metrics(),
                'typeDistribution': type_distribution(),
                'topAnnouncements': top_announcements(),
                'recommendation': recommendation_performance(),
                'insights': generate_admin_insights()[:8],
            },
        ))


class AnnouncementScheduledDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['view']

    def get(self, request):
        return Response(envelope(
            True,
            'Scheduled dashboard loaded',
            data=scheduled_dashboard_summary(),
        ))


class AnnouncementListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    required_permission = ANNOUNCEMENT_PERMISSIONS['view']

    def get(self, request):
        qs = announcements_list_queryset(request.query_params.dict())
        items, meta = paginate_queryset(qs, request, default_page_size=15)
        audience_counts = {a.pk: estimate_audience_count(a) for a in items}
        ser = AnnouncementListSerializer(
            items, many=True, context={'request': request, 'audience_counts': audience_counts},
        )
        return Response(envelope(True, 'List loaded', data=paginated_payload(ser.data, meta)))

    def post(self, request):
        from apps.admin_management.services.admins import get_admin_effective_permissions
        from apps.admin_management.services.scopes import is_super_admin
        if not (request.user.is_superuser or is_super_admin(request.user)):
            if ANNOUNCEMENT_PERMISSIONS['create'] not in get_admin_effective_permissions(request.user):
                return Response(envelope(False, 'Permission denied'), status=403)
        ser = AnnouncementWriteSerializer(data=request.data, context={'request': request})
        if not ser.is_valid():
            return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)
        ann = ser.save()
        detail = AnnouncementDetailSerializer(ann, context={'request': request})
        return Response(envelope(True, 'Created', data=detail.data), status=201)


class AnnouncementDetailView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    required_permission = ANNOUNCEMENT_PERMISSIONS['view']

    def _get(self, uuid):
        return get_object_or_404(
            Announcement.objects.select_related('announcement_type', 'created_by')
            .prefetch_related(
                'targets__filiere',
                'targets__class_group',
                'targets__academic_level',
                'targets__internship_type',
                'attachments',
            ),
            uuid=uuid,
        )

    def get(self, request, uuid):
        ann = self._get(uuid)
        analytics = announcement_detail_analytics(ann)
        ser = AnnouncementDetailSerializer(
            ann,
            context={'request': request, 'detail_analytics': analytics},
        )
        logs = ann.publication_logs.all()[:20]
        return Response(envelope(
            True,
            'Detail loaded',
            data={
                'announcement': ser.data,
                'publicationHistory': PublicationLogSerializer(logs, many=True).data,
                'audienceCount': estimate_audience_count(ann),
            },
        ))

    def patch(self, request, uuid):
        from apps.admin_management.services.admins import get_admin_effective_permissions
        from apps.admin_management.services.scopes import is_super_admin
        if not (request.user.is_superuser or is_super_admin(request.user)):
            if ANNOUNCEMENT_PERMISSIONS['edit'] not in get_admin_effective_permissions(request.user):
                return Response(envelope(False, 'Permission denied'), status=403)
        ann = self._get(uuid)
        ser = AnnouncementWriteSerializer(ann, data=request.data, partial=True, context={'request': request})
        if not ser.is_valid():
            return Response(envelope(False, 'Validation error', errors=ser.errors), status=400)
        ann = ser.save()
        detail = AnnouncementDetailSerializer(
            ann,
            context={'request': request, 'detail_analytics': announcement_detail_analytics(ann)},
        )
        return Response(envelope(True, 'Updated', data=detail.data))

    def delete(self, request, uuid):
        from apps.admin_management.services.admins import get_admin_effective_permissions
        from apps.admin_management.services.scopes import is_super_admin
        if not (request.user.is_superuser or is_super_admin(request.user)):
            if ANNOUNCEMENT_PERMISSIONS['archive'] not in get_admin_effective_permissions(request.user):
                return Response(envelope(False, 'Permission denied'), status=403)
        ann = self._get(uuid)
        ann.delete()
        return Response(envelope(True, 'Deleted'))


class AnnouncementEmailPreviewView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['view']

    def get(self, request, uuid):
        from django.conf import settings as django_settings

        from apps.notifications.services.template_service import render_notification

        from .services.email_preview import build_announcement_email_preview_html

        ann = get_object_or_404(
            Announcement.objects.select_related('announcement_type', 'created_by')
            .prefetch_related('attachments'),
            uuid=uuid,
        )
        language = request.query_params.get('language', 'fr')
        if language not in ('fr', 'en', 'ar'):
            language = 'fr'

        summary_text = ann.summary or ''
        if not summary_text and ann.body:
            plain = re.sub(r'<[^>]+>', ' ', ann.body)
            summary_text = ' '.join(plain.split())[:200]

        frontend_base = getattr(django_settings, 'FRONTEND_BASE_URL', '').rstrip('/')
        action_url = (
            f'{frontend_base}/student/announcements/{ann.uuid}'
            if frontend_base
            else f'/student/announcements/{ann.uuid}'
        )

        rendered = render_notification(
            template_code='announcement_published',
            channel='EMAIL',
            language=language,
            context={
                'title': ann.title,
                'body': summary_text,
                'action_url': action_url,
            },
        )

        rich_body_html = build_announcement_email_preview_html(ann, request, language)
        attachments = [
            {
                'id': att.id,
                'label': att.label or att.original_filename,
                'originalFilename': att.original_filename or att.label or '',
                'fileUrl': request.build_absolute_uri(att.file.url) if att.file and request else (att.file.url if att.file else None),
                'externalUrl': att.external_url or None,
                'mimeType': att.mime_type or '',
                'fileSizeBytes': att.file_size_bytes,
                'kind': att.kind,
            }
            for att in ann.attachments.all()
        ]
        cover_url = None
        if ann.cover_image:
            cover_url = request.build_absolute_uri(ann.cover_image.url) if request else ann.cover_image.url

        sender_name = 'Digital Talent Center'
        sender_email = 'noreply@talent-center.ma'
        try:
            from apps.notifications.models_email_config import PlatformEmailSettings

            platform_settings = PlatformEmailSettings.objects.first()
            if platform_settings:
                sender_name = platform_settings.default_sender_name or sender_name
                sender_email = platform_settings.default_sender_email or sender_email
        except Exception:
            pass

        has_rich_content = bool(
            ann.title
            or ann.summary
            or ann.body
            or ann.cover_image
            or attachments
        )

        return Response(envelope(True, 'Email preview', data={
            'subject': rendered.subject,
            'body_html': rich_body_html,
            'body_text': summary_text,
            'action_url': rendered.action_url or action_url,
            'sender_name': sender_name,
            'sender_email': sender_email,
            'template_code': 'announcement_published',
            'language': language,
            'has_rich_content': has_rich_content,
            'cover_image_url': cover_url,
            'attachments': attachments,
        }))


class AnnouncementActionView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['publish']

    def post(self, request, uuid, action):
        ann = get_object_or_404(Announcement, uuid=uuid)
        user = request.user
        if action == 'publish':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['publish']
            publish_announcement(ann, user)
        elif action == 'schedule':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['publish']
            schedule_announcement(ann, user)
        elif action == 'cancel-schedule':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['publish']
            ann = cancel_schedule(ann, user)
        elif action == 'unpublish':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['publish']
            unpublish_announcement(ann, user)
        elif action == 'archive':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['archive']
            archive_announcement(ann, user)
        elif action == 'unarchive':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['archive']
            unarchive_announcement(ann, user)
        elif action == 'duplicate':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['create']
            ann = duplicate_announcement(ann, user)
        elif action == 'recompute-scores':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['recommendation']
            count = recompute_scores_for_announcement(ann)
            return Response(envelope(True, f'Recomputed {count} scores', data={'count': count}))
        else:
            return Response(envelope(False, 'Unknown action'), status=400)
        detail = AnnouncementDetailSerializer(ann, context={'request': request})
        return Response(envelope(True, f'Action {action} completed', data=detail.data))


class AnnouncementBulkActionView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['publish']

    def post(self, request):
        ids = request.data.get('ids', [])
        action = request.data.get('action', '')
        if not ids or not action:
            return Response(envelope(False, 'ids and action required'), status=400)
        anns = Announcement.objects.filter(uuid__in=ids)
        count = 0
        if action == 'delete':
            from apps.admin_management.services.admins import get_admin_effective_permissions
            from apps.admin_management.services.scopes import is_super_admin
            if not (request.user.is_superuser or is_super_admin(request.user)):
                if ANNOUNCEMENT_PERMISSIONS['archive'] not in get_admin_effective_permissions(request.user):
                    return Response(envelope(False, 'Permission denied'), status=403)
            count, _ = anns.delete()
            return Response(envelope(True, f'Bulk delete: {count} items', data={'deleted': count}))
        for ann in anns:
            if action == 'publish':
                publish_announcement(ann, request.user)
            elif action == 'archive':
                archive_announcement(ann, request.user)
            elif action == 'unarchive':
                unarchive_announcement(ann, request.user)
            elif action == 'unpublish':
                unpublish_announcement(ann, request.user)
            count += 1
        return Response(envelope(True, f'Bulk {action}: {count} items'))


class AnnouncementAttachmentUploadView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['edit']
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, uuid):
        from django.core.exceptions import ValidationError
        from django.core.validators import URLValidator

        from .serializers import AnnouncementAttachmentSerializer

        ann = get_object_or_404(Announcement, uuid=uuid)
        upload = request.FILES.get('file')
        external_url = (request.data.get('external_url') or '').strip()
        label = (request.data.get('label') or '').strip()

        if upload:
            att = AnnouncementAttachment.objects.create(
                announcement=ann,
                file=upload,
                original_filename=upload.name,
                file_size_bytes=upload.size,
                mime_type=getattr(upload, 'content_type', '') or '',
                kind=request.data.get('kind', 'FILE'),
                label=label or upload.name,
            )
        elif external_url:
            try:
                URLValidator()(external_url)
            except ValidationError:
                return Response(envelope(False, 'Invalid external_url'), status=400)
            att = AnnouncementAttachment.objects.create(
                announcement=ann,
                kind=AnnouncementAttachment.AttachmentKind.EXTERNAL_LINK,
                external_url=external_url,
                label=label or external_url,
                original_filename=external_url[:255],
            )
        else:
            return Response(envelope(False, 'file or external_url required'), status=400)

        return Response(
            envelope(True, 'Uploaded', data=AnnouncementAttachmentSerializer(att, context={'request': request}).data),
            status=201,
        )


class AnnouncementCoverUploadView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['edit']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, uuid):
        ann = get_object_or_404(Announcement, uuid=uuid)
        upload = request.FILES.get('cover') or request.FILES.get('file')
        if not upload:
            return Response(envelope(False, 'cover file required'), status=400)
        ann.cover_image = upload
        ann.updated_by = request.user
        ann.save(update_fields=['cover_image', 'updated_by', 'updated_at'])
        detail = AnnouncementDetailSerializer(ann, context={'request': request})
        return Response(envelope(True, 'Cover uploaded', data=detail.data))


def _types_manage_allowed(request) -> bool:
    checker = EffectiveHasPermission()
    view = type('V', (), {'required_permission': ANNOUNCEMENT_PERMISSIONS['types_manage']})()
    return checker.has_permission(request, view)


class AnnouncementTypeListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['view']

    def get(self, request):
        if not AnnouncementType.objects.exists():
            seed_announcement_types()
        include_inactive = request.query_params.get('include_inactive', '').lower() in ('1', 'true')
        qs = AnnouncementType.objects.all() if include_inactive else AnnouncementType.objects.filter(is_active=True)
        qs = qs.annotate(
            announcement_count=models.Count('announcements'),
        ).order_by('sort_order', 'code')
        return Response(envelope(
            True,
            'Types loaded',
            data=AnnouncementTypeSerializer(qs, many=True, context={'request': request}).data,
        ))

    def post(self, request):
        if not _types_manage_allowed(request):
            return Response(envelope(False, 'Permission denied'), status=status.HTTP_403_FORBIDDEN)
        serializer = AnnouncementTypeWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(envelope(False, 'Validation failed', errors=serializer.errors), status=400)
        data = dict(serializer.validated_data)
        if not data.get('name_i18n'):
            name = data.get('name', '')
            data['name_i18n'] = {'fr': name, 'en': name, 'ar': name}
        max_order = AnnouncementType.objects.order_by('-sort_order').values_list('sort_order', flat=True).first() or 0
        sort_order = data.pop('sort_order', max_order + 1)
        obj = AnnouncementType.objects.create(
            is_system=False,
            sort_order=sort_order,
            **data,
        )
        return Response(
            envelope(
                True,
                'Type created',
                data=AnnouncementTypeSerializer(obj, context={'request': request}).data,
            ),
            status=status.HTTP_201_CREATED,
        )


class AnnouncementTypeManageView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['types_manage']

    def patch(self, request, pk):
        obj = get_object_or_404(AnnouncementType, pk=pk)
        payload = dict(request.data)
        if obj.is_system and 'code' in payload:
            payload.pop('code')
        serializer = AnnouncementTypeWriteSerializer(obj, data=payload, partial=True)
        if not serializer.is_valid():
            return Response(envelope(False, 'Validation failed', errors=serializer.errors), status=400)
        serializer.save()
        return Response(envelope(
            True,
            'Type updated',
            data=AnnouncementTypeSerializer(obj, context={'request': request}).data,
        ))

    def delete(self, request, pk):
        obj = get_object_or_404(AnnouncementType, pk=pk)
        if obj.announcements.exists():
            obj.is_active = False
            obj.save(update_fields=['is_active', 'updated_at'])
            return Response(envelope(
                True,
                'Type deactivated (used by existing announcements)',
                data=AnnouncementTypeSerializer(obj, context={'request': request}).data,
            ))
        if obj.is_system:
            obj.is_active = False
            obj.save(update_fields=['is_active', 'updated_at'])
            return Response(envelope(
                True,
                'System type deactivated',
                data=AnnouncementTypeSerializer(obj, context={'request': request}).data,
            ))
        obj.delete()
        return Response(envelope(True, 'Type deleted'))


class AnnouncementTypeSeedView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['types_manage']

    def post(self, request):
        result = seed_announcement_types()
        return Response(envelope(True, 'Types seeded', data=result))


class AnnouncementAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['analytics']

    def get(self, request):
        return Response(envelope(
            True,
            'Analytics loaded',
            data={
                'engagement': engagement_metrics(),
                'typeDistribution': type_distribution(),
                'topAnnouncements': top_announcements(20),
                'recommendation': recommendation_performance(),
            },
        ))


class AnnouncementInsightsView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['analytics']

    def get(self, request):
        return Response(envelope(True, 'Insights loaded', data=generate_admin_insights()))


class AnnouncementEngagementView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['analytics']

    def get(self, request):
        return Response(envelope(
            True,
            'Engagement analytics',
            data=engagement_dashboard(),
        ))


class StudentAnnouncementFeedView(APIView):
    """Student feed API — published announcements visible to the student."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)
        params = request.query_params
        feed = get_student_announcement_feed(
            profile,
            request=request,
            type_code=params.get('type') or None,
            priority=params.get('priority') or None,
            date_filter=params.get('date') or None,
            search=params.get('search') or None,
            limit=int(params.get('limit', 100)),
        )
        return Response(envelope(True, 'Feed loaded', data=feed))


class StudentAnnouncementDetailView(APIView):
    """Single published announcement detail for the current student."""

    permission_classes = [IsAuthenticated]

    def get(self, request, uuid):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)

        detail = get_student_announcement_detail(
            profile,
            announcement_uuid=uuid,
            request=request,
        )
        if not detail:
            return Response(envelope(False, 'Announcement not available'), status=404)

        return Response(envelope(True, 'Detail loaded', data=detail))


class StudentAnnouncementEngageView(APIView):
    """Track student click engagement on links and attachments."""

    permission_classes = [IsAuthenticated]

    def post(self, request, uuid):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)

        announcement = get_object_or_404(
            Announcement.objects.select_related('announcement_type'),
            uuid=uuid,
            status=Announcement.Status.PUBLISHED,
        )
        if not announcement_visible_to_student(announcement, profile):
            return Response(envelope(False, 'Announcement not available'), status=404)

        action = (request.data.get('action') or 'CLICK').upper()
        if action != StudentAnnouncementAction.ActionType.CLICK:
            return Response(envelope(False, 'Unsupported engagement action'), status=400)

        metadata = {
            key: request.data.get(key)
            for key in ('url', 'label', 'source')
            if request.data.get(key)
        }
        record_student_announcement_click(profile, announcement, metadata=metadata)
        return Response(envelope(True, 'Engagement recorded', data={
            'announcementId': str(announcement.uuid),
            'action': action,
        }))


class StudentAnnouncementChatView(APIView):
    """Open or continue a support thread about a specific announcement."""

    permission_classes = [IsAuthenticated]

    def post(self, request, uuid):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)

        announcement = get_object_or_404(
            Announcement.objects.select_related('announcement_type'),
            uuid=uuid,
            status=Announcement.Status.PUBLISHED,
        )
        if not announcement_visible_to_student(announcement, profile):
            return Response(envelope(False, 'Announcement not available'), status=404)

        conv = get_or_create_announcement_conversation(
            announcement=announcement,
            student=profile,
            created_by=request.user,
            request=request,
        )
        message_body = (request.data.get('message') or '').strip()
        if message_body:
            send_announcement_message(conversation=conv, sender=request.user, body=message_body)
        return Response(envelope(True, 'Conversation ready', data={
            'conversation_id': conv.pk,
            'announcement_id': str(announcement.uuid),
        }))


class StudentAnnouncementSavedFeedView(APIView):
    """Saved and favorited announcements for the current student."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)
        params = request.query_params
        feed = get_student_saved_announcement_feed(
            profile,
            request=request,
            search=params.get('search') or None,
            limit=int(params.get('limit', 100)),
        )
        return Response(envelope(True, 'Saved announcements loaded', data=feed))


class StudentAnnouncementBookmarkView(APIView):
    """Toggle save or favorite bookmark on an announcement."""

    permission_classes = [IsAuthenticated]

    def post(self, request, uuid):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)

        announcement = get_object_or_404(
            Announcement.objects.select_related('announcement_type'),
            uuid=uuid,
            status=Announcement.Status.PUBLISHED,
        )
        if not announcement_visible_to_student(announcement, profile):
            return Response(envelope(False, 'Announcement not available'), status=404)

        bookmark_type = (request.data.get('type') or 'SAVE').upper()
        try:
            result = toggle_student_announcement_bookmark(profile, announcement, bookmark_type)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)

        flags = bookmark_flags_for_student(profile, {announcement.pk}).get(
            announcement.pk,
            {'isSaved': False, 'isFavorited': False},
        )
        return Response(envelope(True, 'Bookmark updated', data={
            **result,
            'announcementId': str(announcement.uuid),
            'isSaved': flags['isSaved'],
            'isFavorited': flags['isFavorited'],
        }))
