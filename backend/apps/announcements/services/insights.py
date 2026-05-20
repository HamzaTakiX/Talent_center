"""Smart admin insights for announcements module."""

from __future__ import annotations

from django.db.models import Sum
from django.utils import timezone

from apps.announcements.models import Announcement, RecommendationScore


def generate_admin_insights() -> list[dict]:
    now = timezone.now()
    insights: list[dict] = []

    for a in Announcement.objects.filter(
        status=Announcement.Status.PUBLISHED, view_count__lt=10,
    ).order_by('view_count')[:5]:
        insights.append({
            'kind': 'underperforming',
            'severity': 'warning',
            'announcementId': str(a.uuid),
            'title': a.title,
            'message': f'Low engagement: {a.view_count} views',
        })

    for a in Announcement.objects.filter(
        status=Announcement.Status.PUBLISHED,
        application_deadline__lte=now + timezone.timedelta(days=7),
        application_deadline__gte=now,
    )[:5]:
        insights.append({
            'kind': 'expiring_offer',
            'severity': 'info',
            'announcementId': str(a.uuid),
            'title': a.title,
            'message': 'Application deadline within 7 days',
        })

    for row in (
        Announcement.objects.filter(status=Announcement.Status.PUBLISHED)
        .values('announcement_type__code', 'announcement_type__name')
        .annotate(total_views=Sum('view_count'))
        .order_by('-total_views')[:3]
    ):
        insights.append({
            'kind': 'high_engagement_category',
            'severity': 'success',
            'typeCode': row['announcement_type__code'],
            'title': row['announcement_type__name'],
            'message': f"{row['total_views']} total views",
        })

    for a in Announcement.objects.filter(
        status=Announcement.Status.PUBLISHED, view_count__gt=50, click_count=0,
    )[:5]:
        insights.append({
            'kind': 'ignored_content',
            'severity': 'warning',
            'announcementId': str(a.uuid),
            'title': a.title,
            'message': 'High views but no clicks',
        })

    reco_total = RecommendationScore.objects.filter(is_recommended=True).count()
    reco_all = RecommendationScore.objects.count()
    if reco_all:
        rate = reco_total / reco_all * 100
        insights.append({
            'kind': 'recommendation_effectiveness',
            'severity': 'info',
            'title': 'Recommendation engine',
            'message': f'{rate:.1f}% of scored pairs are recommended',
        })

    return insights
