"""Admin & student-prep API views for announcements."""

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.admin_management.pagination import paginate_queryset, paginated_payload
from apps.admin_management.permissions import EffectiveHasPermission, IsPlatformAdmin
from apps.authentication.utils import envelope

from .models import Announcement, AnnouncementAttachment, AnnouncementType
from .permissions import ANNOUNCEMENT_PERMISSIONS
from .serializers import (
    AnnouncementDetailSerializer,
    AnnouncementListSerializer,
    AnnouncementTypeSerializer,
    AnnouncementWriteSerializer,
    PublicationLogSerializer,
)
from .services.analytics import (
    announcement_detail_analytics,
    dashboard_summary,
    engagement_dashboard,
    engagement_metrics,
    recommendation_performance,
    top_announcements,
    type_distribution,
)
from .services.insights import generate_admin_insights
from .services.publication import (
    archive_announcement,
    duplicate_announcement,
    publish_announcement,
    schedule_announcement,
    unpublish_announcement,
)
from .services.queries import announcements_list_queryset
from .services.recommendation import get_student_feed, recompute_scores_for_announcement
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
                'engagement': engagement_metrics(),
                'typeDistribution': type_distribution(),
                'topAnnouncements': top_announcements(),
                'recommendation': recommendation_performance(),
                'insights': generate_admin_insights()[:8],
            },
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
            Announcement.objects.select_related('announcement_type')
            .prefetch_related('targets', 'attachments'),
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
        elif action == 'unpublish':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['publish']
            unpublish_announcement(ann, user)
        elif action == 'archive':
            self.required_permission = ANNOUNCEMENT_PERMISSIONS['archive']
            archive_announcement(ann, user)
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
        for ann in anns:
            if action == 'publish':
                publish_announcement(ann, request.user)
            elif action == 'archive':
                archive_announcement(ann, request.user)
            elif action == 'unpublish':
                unpublish_announcement(ann, request.user)
            count += 1
        return Response(envelope(True, f'Bulk {action}: {count} items'))


class AnnouncementAttachmentUploadView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['edit']
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, uuid):
        ann = get_object_or_404(Announcement, uuid=uuid)
        upload = request.FILES.get('file')
        if not upload:
            return Response(envelope(False, 'file required'), status=400)
        att = AnnouncementAttachment.objects.create(
            announcement=ann,
            file=upload,
            original_filename=upload.name,
            file_size_bytes=upload.size,
            mime_type=getattr(upload, 'content_type', '') or '',
            kind=request.data.get('kind', 'FILE'),
            label=request.data.get('label', upload.name),
        )
        from .serializers import AnnouncementAttachmentSerializer
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


class AnnouncementTypeListView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['view']

    def get(self, request):
        if not AnnouncementType.objects.exists():
            seed_announcement_types()
        qs = AnnouncementType.objects.filter(is_active=True).order_by('sort_order')
        return Response(envelope(
            True,
            'Types loaded',
            data=AnnouncementTypeSerializer(qs, many=True, context={'request': request}).data,
        ))


class AnnouncementTypeManageView(APIView):
    permission_classes = [IsAuthenticated, IsPlatformAdmin, EffectiveHasPermission]
    required_permission = ANNOUNCEMENT_PERMISSIONS['types_manage']

    def patch(self, request, pk):
        obj = get_object_or_404(AnnouncementType, pk=pk)
        for field in ('is_active', 'is_mutable', 'is_bannable', 'recommendation_weight', 'recommendation_boost', 'default_priority'):
            if field in request.data:
                setattr(obj, field, request.data[field])
        if 'name_i18n' in request.data:
            obj.name_i18n = request.data['name_i18n']
        obj.save()
        return Response(envelope(
            True,
            'Type updated',
            data=AnnouncementTypeSerializer(obj, context={'request': request}).data,
        ))


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
    """Student feed API — prepared for future student frontend."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = getattr(request.user, 'student_profile', None)
        if not profile:
            return Response(envelope(False, 'Student profile required'), status=403)
        feed = get_student_feed(profile)
        return Response(envelope(True, 'Feed loaded', data={'items': feed}))
