"""Internship offers analytics — views, applications, conversion, engagement."""

from __future__ import annotations

from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, F, Q, Sum
from django.utils import timezone

from apps.stage.models import (
    InternshipOffer,
    OfferAnalyticsSnapshot,
    OfferApplication,
    StudentOfferMatchScore,
)


def _active_offers_qs():
    return InternshipOffer.objects.exclude(
        status__in=[InternshipOffer.Status.DELETED, InternshipOffer.Status.DRAFT],
    )


_ONGOING_APPLICATION_STATUSES = (
    OfferApplication.Status.SUBMITTED,
    OfferApplication.Status.UNDER_REVIEW,
    OfferApplication.Status.SHORTLISTED,
    OfferApplication.Status.INTERVIEW,
)


def dashboard_summary() -> dict:
    offers = _active_offers_qs()
    applications = OfferApplication.objects.all()
    accepted = applications.filter(status=OfferApplication.Status.ACCEPTED)
    total_apps = applications.count()
    accepted_count = accepted.count()
    now = timezone.now()
    week_end = now + timedelta(days=7)
    return {
        'total_offers': offers.count(),
        'open_offers': offers.filter(status=InternshipOffer.Status.OPEN).count(),
        'published_offers': offers.filter(
            status__in=[InternshipOffer.Status.PUBLISHED, InternshipOffer.Status.OPEN],
        ).count(),
        'total_applications': total_apps,
        'ongoing_applications': applications.filter(status__in=_ONGOING_APPLICATION_STATUSES).count(),
        'expiring_offers_this_week': offers.filter(
            status__in=[InternshipOffer.Status.OPEN, InternshipOffer.Status.PUBLISHED],
            application_deadline__gte=now,
            application_deadline__lte=week_end,
        ).count(),
        'acceptance_rate': round(accepted_count / total_apps * 100, 2) if total_apps else 0,
        'total_views': offers.aggregate(total=Sum('view_count'))['total'] or 0,
    }


def offer_views_stats(*, days: int = 30) -> dict:
    since = timezone.now() - timedelta(days=days)
    offers = _active_offers_qs().filter(created_at__gte=since)
    return {
        'period_days': days,
        'total_views': offers.aggregate(total=Sum('view_count'))['total'] or 0,
        'avg_views_per_offer': round(
            (offers.aggregate(total=Sum('view_count'))['total'] or 0) / max(offers.count(), 1),
            2,
        ),
    }


def application_stats(*, days: int = 30) -> dict:
    since = timezone.now() - timedelta(days=days)
    apps = OfferApplication.objects.filter(applied_at__gte=since)
    by_status = dict(apps.values_list('status').annotate(c=Count('id')).values_list('status', 'c'))
    return {
        'period_days': days,
        'total': apps.count(),
        'by_status': by_status,
    }


def conversion_rate(*, days: int = 30) -> dict:
    since = timezone.now() - timedelta(days=days)
    offers = _active_offers_qs().filter(published_at__gte=since)
    total_views = offers.aggregate(v=Sum('view_count'))['v'] or 0
    apps = OfferApplication.objects.filter(applied_at__gte=since).count()
    rate = round(apps / total_views * 100, 2) if total_views else 0
    return {'views': total_views, 'applications': apps, 'conversion_rate_pct': rate}


def _offer_company_logo_url(offer: InternshipOffer, request=None) -> str | None:
    if offer.company_logo:
        url = offer.company_logo.url
        if request:
            return request.build_absolute_uri(url)
        return url
    meta_logo = (offer.metadata_json or {}).get('company_logo')
    if meta_logo:
        return str(meta_logo)
    company = getattr(offer, 'company', None)
    if company and getattr(company, 'logo', None):
        url = company.logo.url
        if request:
            return request.build_absolute_uri(url)
        return url
    return None


def most_active_offers(limit: int = 10, *, request=None) -> list[dict]:
    offers = (
        _active_offers_qs()
        .select_related('company')
        .annotate(app_count=Count('applications'))
        .order_by('-application_count', '-view_count')[:limit]
    )
    return [
        {
            'id': o.pk,
            'uuid': str(o.uuid),
            'title': o.title,
            'company_name': o.company_name,
            'company_logo_url': _offer_company_logo_url(o, request),
            'location_city': o.location_city or None,
            'application_deadline': (
                o.application_deadline.isoformat() if o.application_deadline else None
            ),
            'status': o.status,
            'view_count': o.view_count,
            'application_count': o.application_count,
            'app_count_computed': o.app_count,
        }
        for o in offers
    ]


def most_active_companies(limit: int = 10) -> list[dict]:
    rows = (
        _active_offers_qs()
        .values('company_name')
        .annotate(
            offer_count=Count('id'),
            total_applications=Sum('application_count'),
            total_views=Sum('view_count'),
        )
        .order_by('-total_applications')[:limit]
    )
    return list(rows)


def top_matching_offers(limit: int = 10) -> list[dict]:
    scores = (
        StudentOfferMatchScore.objects.filter(is_recommended=True, score__gte=70)
        .values('offer_id', 'offer__title', 'offer__company_name')
        .annotate(avg_score=Sum('score'), match_count=Count('id'))
        .order_by('-avg_score')[:limit]
    )
    return [
        {
            'offer_id': s['offer_id'],
            'title': s['offer__title'],
            'company_name': s['offer__company_name'],
            'avg_score': float(s['avg_score'] or 0),
            'match_count': s['match_count'],
        }
        for s in scores
    ]


def student_engagement(*, days: int = 30) -> dict:
    since = timezone.now() - timedelta(days=days)
    active_students = (
        OfferApplication.objects.filter(applied_at__gte=since)
        .values('student_profile_id')
        .distinct()
        .count()
    )
    repeat_applicants = (
        OfferApplication.objects.filter(applied_at__gte=since)
        .values('student_profile_id')
        .annotate(c=Count('id'))
        .filter(c__gt=1)
        .count()
    )
    return {
        'active_applicants': active_students,
        'repeat_applicants': repeat_applicants,
        'period_days': days,
    }


def generate_analytics_snapshot(*, period: str = 'daily') -> OfferAnalyticsSnapshot:
    today = timezone.now().date()
    metrics = {
        'summary': dashboard_summary(),
        'views': offer_views_stats(),
        'applications': application_stats(),
        'conversion': conversion_rate(),
        'most_active_offers': most_active_offers(5, request=None),
        'most_active_companies': most_active_companies(5),
        'top_matching': top_matching_offers(5),
        'engagement': student_engagement(),
        'generated_at': timezone.now().isoformat(),
    }
    snapshot, _ = OfferAnalyticsSnapshot.objects.update_or_create(
        snapshot_date=today,
        period=period,
        defaults={'metrics_json': metrics},
    )
    return snapshot


def full_analytics_dashboard(*, request=None) -> dict:
    return {
        'summary': dashboard_summary(),
        'views': offer_views_stats(),
        'applications': application_stats(),
        'conversion': conversion_rate(),
        'mostActiveOffers': most_active_offers(request=request),
        'mostActiveCompanies': most_active_companies(),
        'topMatchingOffers': top_matching_offers(),
        'studentEngagement': student_engagement(),
    }
