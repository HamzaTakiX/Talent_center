"""
Chat / Messaging domain models.

Topology:
- Channel = top-level container (department, cohort, project).
- Conversation = a thread inside a Channel, or a stand-alone DM.
- ConversationParticipant = membership row with role + read state.
- Message = the unit of content; supports threading via parent_message.
- Mention / Tag are independent metadata layers over Message.
"""

from django.conf import settings
from django.db import models
from django.db.models import UniqueConstraint
from django.utils.translation import gettext_lazy as _

from apps.accounts_et_roles.models import TimestampedModel


# ============================================================================
# 1. CHANNEL
# ============================================================================

class Channel(TimestampedModel):
    """Top-level container for related conversations."""

    class ChannelType(models.TextChoices):
        PUBLIC = 'PUBLIC', _('Public')
        PRIVATE = 'PRIVATE', _('Private')
        DIRECT = 'DIRECT', _('Direct (DM container)')
        ANNOUNCEMENT = 'ANNOUNCEMENT', _('Announcement')

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    channel_type = models.CharField(
        max_length=16,
        choices=ChannelType.choices,
        default=ChannelType.PUBLIC,
        db_index=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_channels',
    )
    is_archived = models.BooleanField(default=False, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-updated_at']

    def __str__(self) -> str:
        return f'Channel<{self.code}>'


# ============================================================================
# 2. CONVERSATION
# ============================================================================

class Conversation(TimestampedModel):
    """A thread inside a Channel, or a standalone direct conversation."""

    class ConversationType(models.TextChoices):
        GROUP = 'GROUP', _('Group')
        DIRECT = 'DIRECT', _('Direct message')
        THREAD = 'THREAD', _('Thread')

    channel = models.ForeignKey(
        Channel,
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='conversations',
    )
    title = models.CharField(max_length=255, blank=True, default='')
    conversation_type = models.CharField(
        max_length=16,
        choices=ConversationType.choices,
        default=ConversationType.GROUP,
        db_index=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='created_conversations',
    )
    is_archived = models.BooleanField(default=False, db_index=True)
    last_message_at = models.DateTimeField(null=True, blank=True, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['-last_message_at', '-created_at']
        indexes = [
            models.Index(fields=['channel', '-last_message_at']),
            models.Index(fields=['conversation_type', '-last_message_at']),
        ]

    def __str__(self) -> str:
        return f'Conversation<{self.pk} {self.title or self.conversation_type}>'


# ============================================================================
# 3. CONVERSATION PARTICIPANT
# ============================================================================

class ConversationParticipant(TimestampedModel):
    """Membership row tying a User to a Conversation with role + read state."""

    class Role(models.TextChoices):
        OWNER = 'OWNER', _('Owner')
        ADMIN = 'ADMIN', _('Admin')
        MEMBER = 'MEMBER', _('Member')
        OBSERVER = 'OBSERVER', _('Observer')

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='participants',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='conversation_memberships',
    )
    role = models.CharField(
        max_length=16,
        choices=Role.choices,
        default=Role.MEMBER,
        db_index=True,
    )
    joined_at = models.DateTimeField(auto_now_add=True)
    left_at = models.DateTimeField(null=True, blank=True)
    # Denormalised pointer to the last message the user has read.
    # BigIntegerField (not FK) so the message can be hard-deleted
    # without fanning a cascade across every participant row.
    last_read_message_id = models.BigIntegerField(null=True, blank=True)
    is_muted = models.BooleanField(default=False)

    class Meta(TimestampedModel.Meta):
        constraints = [
            UniqueConstraint(
                fields=['conversation', 'user'],
                name='uniq_participant_per_conversation',
            ),
        ]
        indexes = [
            models.Index(fields=['user', 'left_at']),
            models.Index(fields=['conversation', 'role']),
        ]

    def __str__(self) -> str:
        return f'Participant<{self.conversation_id}:{self.user_id} {self.role}>'


# ============================================================================
# 4. MESSAGE
# ============================================================================

class Message(TimestampedModel):
    """Single message in a conversation. Threaded via parent_message."""

    class MessageType(models.TextChoices):
        TEXT = 'TEXT', _('Text')
        FILE = 'FILE', _('File')
        IMAGE = 'IMAGE', _('Image')
        SYSTEM = 'SYSTEM', _('System')
        EVENT = 'EVENT', _('Event')

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages',
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='sent_messages',
    )
    parent_message = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='replies',
    )
    body = models.TextField(blank=True, default='')
    message_type = models.CharField(
        max_length=16,
        choices=MessageType.choices,
        default=MessageType.TEXT,
        db_index=True,
    )
    is_edited = models.BooleanField(default=False)
    edited_at = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        ordering = ['conversation', '-created_at']
        indexes = [
            models.Index(fields=['conversation', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['parent_message', 'created_at']),
        ]

    def __str__(self) -> str:
        return f'Message<{self.pk} conv={self.conversation_id}>'


# ============================================================================
# 5. MESSAGE ATTACHMENT
# ============================================================================

class MessageAttachment(TimestampedModel):
    """File attached to a message."""

    class AttachmentType(models.TextChoices):
        FILE = 'FILE', _('File')
        IMAGE = 'IMAGE', _('Image')
        VIDEO = 'VIDEO', _('Video')
        AUDIO = 'AUDIO', _('Audio')

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='attachments',
    )
    file = models.FileField(upload_to='chat/attachments/%Y/%m/')
    original_filename = models.CharField(max_length=255, blank=True, default='')
    file_size_bytes = models.BigIntegerField(default=0)
    mime_type = models.CharField(max_length=128, blank=True, default='')
    attachment_type = models.CharField(
        max_length=16,
        choices=AttachmentType.choices,
        default=AttachmentType.FILE,
        db_index=True,
    )

    class Meta(TimestampedModel.Meta):
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['message', 'attachment_type']),
        ]

    def __str__(self) -> str:
        return f'Attachment<{self.message_id} {self.attachment_type}>'


# ============================================================================
# 6. MENTION
# ============================================================================

class Mention(models.Model):
    """User mention inside a message body."""

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='mentions',
    )
    mentioned_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mentions_received',
    )
    offset_start = models.PositiveIntegerField(default=0)
    offset_end = models.PositiveIntegerField(default=0)
    read_at = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            UniqueConstraint(
                fields=['message', 'mentioned_user', 'offset_start'],
                name='uniq_mention_per_position',
            ),
        ]
        indexes = [
            models.Index(fields=['mentioned_user', 'read_at']),
            models.Index(fields=['mentioned_user', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'Mention<{self.message_id}->{self.mentioned_user_id}>'


# ============================================================================
# 7. TAG
# ============================================================================

class Tag(TimestampedModel):
    """Free-form tag that can be attached to messages."""

    code = models.SlugField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=255, blank=True, default='')
    color = models.CharField(max_length=16, blank=True, default='')
    is_system = models.BooleanField(default=False)

    class Meta(TimestampedModel.Meta):
        ordering = ['code']

    def __str__(self) -> str:
        return f'Tag<{self.code}>'


# ============================================================================
# 8. MESSAGE TAG (M2M through)
# ============================================================================

class MessageTag(models.Model):
    """Through table linking a message to a tag, with audit fields."""

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='message_tags',
    )
    tag = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        related_name='message_tags',
    )
    tagged_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='+',
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            UniqueConstraint(
                fields=['message', 'tag'],
                name='uniq_message_tag',
            ),
        ]
        indexes = [
            models.Index(fields=['tag', '-created_at']),
        ]

    def __str__(self) -> str:
        return f'MessageTag<{self.message_id}:{self.tag_id}>'


# ============================================================================
# 9. CONVERSATION CONTEXT (business / workflow linkage)
# ============================================================================

class ConversationContext(TimestampedModel):
    """Links a conversation to a module workflow entity (documents, SRF, etc.)."""

    class Module(models.TextChoices):
        PLATFORM = 'platform', _('Platform')
        DOCUMENTS = 'documents', _('Documents')
        SRF = 'srf', _('SRF')
        ANNOUNCEMENTS = 'announcements', _('Announcements')
        ENCADRANT = 'encadrant', _('Encadrant')
        MEETINGS = 'meetings', _('Meetings')
        SMART_ASSIGNMENT = 'smart_assignment', _('Smart assignment')
        OFFERS = 'offers', _('Internship offers')

    class ContextKind(models.TextChoices):
        WORKFLOW_THREAD = 'workflow_thread', _('Workflow thread')
        CHANNEL = 'channel', _('Channel')
        DIRECT = 'direct', _('Direct')
        ANNOUNCEMENT_THREAD = 'announcement_thread', _('Announcement thread')
        MEETING_THREAD = 'meeting_thread', _('Meeting thread')

    class Urgency(models.TextChoices):
        NONE = 'NONE', _('None')
        NORMAL = 'NORMAL', _('Normal')
        HIGH = 'HIGH', _('High')
        CRITICAL = 'CRITICAL', _('Critical')

    conversation = models.OneToOneField(
        Conversation,
        on_delete=models.CASCADE,
        related_name='context',
    )
    module = models.CharField(max_length=32, choices=Module.choices, db_index=True)
    context_kind = models.CharField(
        max_length=32,
        choices=ContextKind.choices,
        default=ContextKind.WORKFLOW_THREAD,
        db_index=True,
    )
    entity_type = models.CharField(max_length=64, blank=True, default='', db_index=True)
    entity_id = models.CharField(max_length=64, blank=True, default='', db_index=True)
    entity_label = models.CharField(max_length=255, blank=True, default='')
    workflow_status = models.CharField(max_length=64, blank=True, default='')
    urgency = models.CharField(
        max_length=16,
        choices=Urgency.choices,
        default=Urgency.NONE,
        db_index=True,
    )
    student_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='student_context_conversations',
    )
    is_internal_only = models.BooleanField(
        default=False,
        help_text=_('Visible to admins/staff only (internal notes).'),
    )
    context_snapshot_json = models.JSONField(default=dict, blank=True)

    class Meta(TimestampedModel.Meta):
        indexes = [
            models.Index(fields=['module', 'entity_type', 'entity_id']),
            models.Index(fields=['module', '-updated_at']),
            models.Index(fields=['urgency', '-updated_at']),
        ]

    def __str__(self) -> str:
        return f'Context<{self.module}:{self.entity_type}/{self.entity_id}>'


# ============================================================================
# 10. MESSAGE REACTION
# ============================================================================

class MessageReaction(models.Model):
    """Emoji reaction on a message."""

    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='reactions',
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='message_reactions',
    )
    emoji_code = models.CharField(max_length=32, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(
                fields=['message', 'user', 'emoji_code'],
                name='uniq_reaction_per_user_emoji',
            ),
        ]
        indexes = [
            models.Index(fields=['message', 'emoji_code']),
        ]

    def __str__(self) -> str:
        return f'Reaction<{self.message_id}:{self.emoji_code}>'
