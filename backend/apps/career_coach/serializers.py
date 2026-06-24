from rest_framework import serializers

from apps.career_coach.models import AiConversation


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=8000)
    session_id = serializers.UUIDField(required=False, allow_null=True)
    mode = serializers.ChoiceField(
        choices=[
            'career-coach',
            'cv-reviewer',
            'ats-expert',
            'interview-mentor',
            'internship-advisor',
        ],
        default='career-coach',
    )
    offer_uuid = serializers.UUIDField(required=False, allow_null=True)
    stream = serializers.BooleanField(default=False)


class ConversationMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiConversation
        fields = ('id', 'role', 'message', 'mode', 'metadata', 'created_at')


class SessionSummarySerializer(serializers.Serializer):
    session_id = serializers.CharField()
    title = serializers.CharField(allow_blank=True)
    mode = serializers.CharField()
    is_archived = serializers.BooleanField()
    created_at = serializers.CharField()
    updated_at = serializers.CharField()
    last_message_at = serializers.CharField(allow_null=True)
    message_count = serializers.IntegerField()
    preview = serializers.CharField()
    last_role = serializers.CharField(allow_null=True)


class CreateSessionSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(
        choices=[
            'career-coach',
            'cv-reviewer',
            'ats-expert',
            'interview-mentor',
            'internship-advisor',
        ],
        default='career-coach',
        required=False,
    )
    title = serializers.CharField(max_length=255, required=False, allow_blank=True, default='')


class UpdateSessionSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=255, required=False, allow_blank=True)
    mode = serializers.ChoiceField(
        choices=[
            'career-coach',
            'cv-reviewer',
            'ats-expert',
            'interview-mentor',
            'internship-advisor',
        ],
        required=False,
    )
    is_archived = serializers.BooleanField(required=False)
