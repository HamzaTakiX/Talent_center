from rest_framework import status

from rest_framework.permissions import IsAuthenticated

from rest_framework.parsers import FormParser, MultiPartParser

from rest_framework.response import Response

from rest_framework.views import APIView



from apps.authentication.utils import envelope

from apps.cv_intelligence.constants import CvSourceType

from apps.cv_intelligence.models import CvIntelligenceReport

from apps.cv_intelligence.serializers import (
    CvIntelligenceReportDetailSerializer,
    CvIntelligenceReportListSerializer,
    CvIntelligenceReportSummarySerializer,
    InterviewAudioTranscribeSerializer,
    InterviewAnswerSubmitSerializer,
    InterviewSessionStartSerializer,
)

from apps.cv_intelligence.services.ai.ollama_client import get_intelligence_config

from apps.cv_intelligence.services.cv_hash import compute_cv_hash_from_builder, compute_cv_hash_from_bytes

from apps.cv_intelligence.services.dashboard_builder import rebuild_dashboard_from_report
from apps.cv_intelligence.services.orchestrator import (
    compare_reports,
    get_active_report,
    resolve_analysis_status,
    run_cv_intelligence_analysis,
)
from apps.cv_intelligence.services.interview_simulation import (
    complete_session,
    get_hub_stats,
    get_session_detail,
    list_sessions,
    start_session,
    submit_answer,
)
from apps.cv_intelligence.services.speech_to_text import transcribe_audio





def _get_student_profile(user):

    profile = getattr(user, 'student_profile', None)

    if profile is None:

        from apps.accounts_et_roles.models import StudentProfile

        profile = StudentProfile.objects.filter(user=user).first()

    return profile





def _build_dashboard_response(
    *,
    report,
    status_label: str,
    current_cv_hash: str = '',
    include_full_report: bool = False,
    request=None,
) -> dict:
    dashboard = report.dashboard_json if report else None
    if report and not dashboard:
        from apps.cv_intelligence.models import CvIntelligenceReport as ReportModel
        full_report = (
            ReportModel.objects.filter(pk=report.pk)
            .select_related('structured_data', 'previous_report', 'student_profile')
            .first()
        )
        if full_report:
            dashboard = rebuild_dashboard_from_report(full_report)
            if dashboard:
                full_report.dashboard_json = dashboard
                full_report.save(update_fields=['dashboard_json', 'updated_at'])

    if dashboard and report and status_label in ('outdated', 'up_to_date', 'failed', 'processing'):
        meta = dict(dashboard.get('meta') or {})
        meta['analysisStatus'] = status_label
        meta['analysisVersion'] = f'v{report.version}'
        meta['cvHash'] = report.cv_hash
        meta['cvVersion'] = report.cv_hash[:12] if report.cv_hash else ''
        meta['lastAnalyzed'] = report.analyzed_at.strftime('%d/%m/%Y %H:%M')
        meta['provider'] = report.provider
        meta['reportUuid'] = str(report.uuid)
        dashboard = {**dashboard, 'meta': meta}

    if dashboard:
        matches = dashboard.get('internshipMatches')
        if matches:
            from apps.cv_intelligence.services.matching.offer_matcher import enrich_internship_match_logos

            dashboard = {
                **dashboard,
                'internshipMatches': enrich_internship_match_logos(matches, request),
            }

    report_data = None
    if report:
        serializer_cls = (
            CvIntelligenceReportDetailSerializer
            if include_full_report
            else CvIntelligenceReportSummarySerializer
        )
        report_data = serializer_cls(report).data

    return {
        'dashboard': dashboard,
        'report': report_data,
        'status': status_label,
        'current_cv_hash': current_cv_hash,
        'analyzed_cv_hash': report.cv_hash if report else None,
        'analysis_version': report.version if report else None,
    }


def _get_dashboard_report(student, current_cv_hash: str = ''):
    """Fetch only fields needed for fast dashboard delivery."""
    base_qs = CvIntelligenceReport.objects.filter(student_profile=student)

    if current_cv_hash:
        matched = (
            base_qs.filter(cv_hash=current_cv_hash, status='completed')
            .only(
                'id', 'uuid', 'dashboard_json', 'cv_hash', 'version', 'status',
                'analyzed_at', 'provider', 'global_score', 'potential_score',
                'ats_score', 'readiness_score', 'source_type', 'is_active',
            )
            .order_by('-analyzed_at')
            .first()
        )
        if matched:
            return matched

    report = (
        base_qs.filter(is_active=True)
        .only(
            'id', 'uuid', 'dashboard_json', 'cv_hash', 'version', 'status',
            'analyzed_at', 'provider', 'global_score', 'potential_score',
            'ats_score', 'readiness_score', 'source_type', 'is_active',
        )
        .order_by('-analyzed_at')
        .first()
    )
    if report:
        return report

    return (
        base_qs.filter(status='completed')
        .only(
            'id', 'uuid', 'dashboard_json', 'cv_hash', 'version', 'status',
            'analyzed_at', 'provider', 'global_score', 'potential_score',
            'ats_score', 'readiness_score', 'source_type', 'is_active',
        )
        .order_by('-analyzed_at')
        .first()
    )





class CvIntelligenceConfigView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request):

        return Response(envelope(True, 'ok', data=get_intelligence_config()))





class CvIntelligenceAnalyzeView(APIView):

    """Full career intelligence analysis from builder payload or file upload."""

    permission_classes = [IsAuthenticated]



    def post(self, request):

        student = _get_student_profile(request.user)

        if not student:

            return Response(

                envelope(False, 'Student profile required.', errors={'profile': ['Not found']}),

                status=status.HTTP_403_FORBIDDEN,

            )



        uploaded = request.FILES.get('file')

        builder_payload = request.data.get('cv') or request.data.get('builder_payload')

        lang = request.data.get('lang') or request.headers.get('Accept-Language', 'fr')[:2]

        force = str(request.data.get('force', '')).lower() in ('1', 'true', 'yes')



        try:

            if uploaded:

                file_bytes = uploaded.read()

                report = run_cv_intelligence_analysis(

                    student=student,

                    source_type=CvSourceType.PDF if uploaded.name.lower().endswith('.pdf') else CvSourceType.DOCX,

                    file_bytes=file_bytes,

                    filename=uploaded.name,

                    lang=lang,

                    force=force,

                )

            elif isinstance(builder_payload, dict):

                report = run_cv_intelligence_analysis(

                    student=student,

                    source_type=CvSourceType.BUILDER,

                    builder_payload=builder_payload,

                    lang=lang,

                    force=force,

                )

            else:

                return Response(

                    envelope(False, 'Provide cv payload or file upload.', errors={'cv': ['Required']}),

                    status=status.HTTP_400_BAD_REQUEST,

                )

        except ValueError as exc:

            return Response(

                envelope(False, str(exc), errors={'source': [str(exc)]}),

                status=status.HTTP_400_BAD_REQUEST,

            )

        except Exception as exc:

            return Response(

                envelope(False, f'Analysis failed: {exc}', errors={'analysis': [str(exc)]}),

                status=status.HTTP_500_INTERNAL_SERVER_ERROR,

            )



        current_cv_hash = report.cv_hash

        status_label = resolve_analysis_status(report, current_cv_hash)



        return Response(

            envelope(

                True,

                'CV Intelligence analysis complete.',

                data={

                    **_build_dashboard_response(

                        report=report,

                        status_label=status_label,

                        current_cv_hash=current_cv_hash,

                        include_full_report=True,

                        request=request,

                    ),

                },

            )

        )





class CvIntelligenceDashboardView(APIView):

    """Return persisted dashboard — never runs AI on GET."""

    permission_classes = [IsAuthenticated]



    def get(self, request):

        student = _get_student_profile(request.user)

        if not student:

            return Response(

                envelope(False, 'Student profile required.'),

                status=status.HTTP_403_FORBIDDEN,

            )



        current_cv_hash = request.query_params.get('cv_hash', '').strip()

        report = _get_dashboard_report(student, current_cv_hash)

        if not report:

            return Response(

                envelope(

                    True,

                    'No analysis yet.',

                    data=_build_dashboard_response(

                        report=None,

                        status_label='none',

                        current_cv_hash=current_cv_hash,

                        request=request,

                    ),

                ),

            )



        status_label = resolve_analysis_status(report, current_cv_hash)



        return Response(

            envelope(

                True,

                'Dashboard loaded',

                data=_build_dashboard_response(

                    report=report,

                    status_label=status_label,

                    current_cv_hash=current_cv_hash,

                    request=request,

                ),

            ),

        )



    def post(self, request):

        return CvIntelligenceAnalyzeView().post(request)





class CvIntelligenceReportListView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request):

        student = _get_student_profile(request.user)

        if not student:

            return Response(envelope(False, 'Student profile required.'), status=status.HTTP_403_FORBIDDEN)



        reports = CvIntelligenceReport.objects.filter(student_profile=student).order_by('-analyzed_at')[:20]

        return Response(

            envelope(True, 'History loaded', data=CvIntelligenceReportListSerializer(reports, many=True).data),

        )





class CvIntelligenceReportDetailView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request, report_uuid):

        student = _get_student_profile(request.user)

        report = CvIntelligenceReport.objects.filter(

            uuid=report_uuid, student_profile=student,

        ).select_related('structured_data').first()

        if not report:

            return Response(envelope(False, 'Report not found.'), status=status.HTTP_404_NOT_FOUND)

        return Response(

            envelope(True, 'Report loaded', data=CvIntelligenceReportDetailSerializer(report).data),

        )





class CvIntelligenceCompareView(APIView):

    permission_classes = [IsAuthenticated]



    def get(self, request, report_uuid, previous_uuid):

        student = _get_student_profile(request.user)

        current = CvIntelligenceReport.objects.filter(uuid=report_uuid, student_profile=student).select_related('structured_data').first()

        previous = CvIntelligenceReport.objects.filter(uuid=previous_uuid, student_profile=student).select_related('structured_data').first()

        if not current or not previous:

            return Response(envelope(False, 'Reports not found.'), status=status.HTTP_404_NOT_FOUND)

        return Response(envelope(True, 'Comparison loaded', data=compare_reports(current, previous)))





class CvIntelligenceInternshipMatchesView(APIView):
    """Return CV-based offer match scores (same logic as Analyse CV par IA)."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = _get_student_profile(request.user)
        if not student:
            return Response(
                envelope(False, 'Student profile required.'),
                status=status.HTTP_403_FORBIDDEN,
            )

        report = get_active_report(student)
        structured: dict = {}
        if report and getattr(report, 'structured_data', None):
            structured = report.structured_data.structured_json or {}

        if not structured:
            return Response(envelope(True, 'No CV analysis yet.', data=[]))

        raw_limit = request.query_params.get('limit', '').strip()
        limit = int(raw_limit) if raw_limit.isdigit() and int(raw_limit) > 0 else None
        offer_uuids = [value.strip() for value in request.query_params.getlist('offer_uuid') if value.strip()]

        from apps.cv_intelligence.services.matching.offer_matcher import (
            compute_all_cv_offer_matches,
            enrich_internship_match_logos,
        )

        matches = compute_all_cv_offer_matches(
            student,
            structured,
            offer_uuids=offer_uuids or None,
            limit=limit,
        )
        matches = enrich_internship_match_logos(matches, request)

        return Response(envelope(True, 'Internship matches loaded', data=matches))


class CvIntelligenceCvHashView(APIView):

    """Compute CV hash server-side for file uploads."""

    permission_classes = [IsAuthenticated]



    def post(self, request):

        uploaded = request.FILES.get('file')

        builder_payload = request.data.get('cv') or request.data.get('builder_payload')



        if uploaded:

            cv_hash = compute_cv_hash_from_bytes(uploaded.read())

        elif isinstance(builder_payload, dict):

            cv_hash = compute_cv_hash_from_builder(builder_payload)

        else:

            return Response(

                envelope(False, 'Provide cv payload or file upload.', errors={'cv': ['Required']}),

                status=status.HTTP_400_BAD_REQUEST,

            )



        return Response(envelope(True, 'Hash computed', data={'cv_hash': cv_hash}))


class CvIntelligenceOfferComparisonView(APIView):
    """AI comparison of student CV + profile against a specific offer."""

    permission_classes = [IsAuthenticated]

    def get(self, request, offer_uuid):
        from apps.stage.models import InternshipOffer
        from apps.cv_intelligence.services.offer_ai_coach import build_offer_comparison

        student = _get_student_profile(request.user)
        if not student:
            return Response(
                envelope(False, 'Student profile required.'),
                status=status.HTTP_403_FORBIDDEN,
            )

        offer = InternshipOffer.objects.filter(uuid=offer_uuid).first()
        if not offer:
            return Response(envelope(False, 'Offer not found.'), status=status.HTTP_404_NOT_FOUND)

        lang = request.query_params.get('lang', 'fr')[:2]
        data = build_offer_comparison(student, offer, lang=lang)
        return Response(envelope(True, 'Offer comparison loaded', data=data))


class CvIntelligenceOfferInterviewStartView(APIView):
    """Start an offer-specific interview simulation session."""

    permission_classes = [IsAuthenticated]

    def post(self, request, offer_uuid):
        student = _get_student_profile(request.user)
        if not student:
            return Response(
                envelope(False, 'Student profile required.'),
                status=status.HTTP_403_FORBIDDEN,
            )

        payload = {
            'mode': 'offer',
            'offer_uuid': str(offer_uuid),
            'difficulty': request.data.get('difficulty') or 'medium',
            'duration_minutes': request.data.get('duration_minutes') or 20,
            'language': request.data.get('lang') or request.data.get('language') or 'fr',
            'communication_mode': request.data.get('communication_mode') or 'text',
            'interview_type': request.data.get('interview_type') or 'mixed',
            'recruiter_profile': request.data.get('recruiter_profile') or '',
        }
        try:
            data = start_session(student=student, payload=payload)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=status.HTTP_400_BAD_REQUEST)
        if not data.get('requires_missing_fields'):
            data = {
                **data,
                'session_id': data.get('session_uuid'),
                'questions': [
                    {
                        'id': turn.get('question_uuid'),
                        'text': turn.get('question'),
                        'category': turn.get('category'),
                    }
                    for turn in data.get('turns', []) if turn.get('question')
                ],
                'total_questions': len(data.get('turns', [])),
            }
        try:
            from apps.profile_intelligence.services import activity_tracking_service
            from apps.profile_intelligence.jobs.celery_tasks import schedule_student_recompute
            activity_tracking_service.track_action(
                student_profile=student,
                source_app='cv_intelligence',
                action_code='interview.simulation.started',
                metadata={'offer_uuid': str(offer_uuid)},
            )
            schedule_student_recompute(student.pk)
        except Exception:
            pass
        return Response(envelope(True, 'Interview session started', data=data))


class CvIntelligenceOfferInterviewEvaluateView(APIView):
    """Evaluate an answer in an offer-specific interview simulation."""

    permission_classes = [IsAuthenticated]

    def post(self, request, offer_uuid):
        student = _get_student_profile(request.user)
        if not student:
            return Response(
                envelope(False, 'Student profile required.'),
                status=status.HTTP_403_FORBIDDEN,
            )

        session_uuid = request.data.get('session_id') or request.data.get('session_uuid')
        if session_uuid:
            payload = {
                'question_uuid': request.data.get('question_uuid'),
                'answer': request.data.get('answer'),
            }
            serializer = InterviewAnswerSubmitSerializer(data=payload)
            if not serializer.is_valid():
                return Response(envelope(False, 'Validation error', errors=serializer.errors), status=400)
            try:
                data = submit_answer(
                    student=student,
                    session_uuid=str(session_uuid),
                    payload=serializer.validated_data,
                )
            except ValueError as exc:
                return Response(envelope(False, str(exc)), status=status.HTTP_400_BAD_REQUEST)
        else:
            from apps.stage.models import InternshipOffer
            from apps.cv_intelligence.services.offer_ai_coach import evaluate_offer_interview_answer

            offer = InternshipOffer.objects.filter(uuid=offer_uuid).first()
            if not offer:
                return Response(envelope(False, 'Offer not found.'), status=status.HTTP_404_NOT_FOUND)
            question = request.data.get('question')
            answer = str(request.data.get('answer') or '').strip()
            if not isinstance(question, dict) or not question.get('text'):
                return Response(
                    envelope(False, 'Question required.', errors={'question': ['Required']}),
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if not answer:
                return Response(
                    envelope(False, 'Answer required.', errors={'answer': ['Required']}),
                    status=status.HTTP_400_BAD_REQUEST,
                )
            lang = str(request.data.get('lang') or 'fr')[:2]
            data = evaluate_offer_interview_answer(
                student, offer, question=question, answer=answer, lang=lang,
            )
        try:
            from apps.profile_intelligence.services import activity_tracking_service
            from apps.profile_intelligence.jobs.celery_tasks import schedule_student_recompute
            score = data.get('score') or data.get('overall_score')
            activity_tracking_service.track_action(
                student_profile=student,
                source_app='cv_intelligence',
                action_code='interview.simulation.evaluated',
                metadata={'offer_uuid': str(offer_uuid), 'score': score},
            )
            schedule_student_recompute(student.pk)
        except Exception:
            pass
        return Response(envelope(True, 'Answer evaluated', data=data))


class InterviewSessionStartView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        student = _get_student_profile(request.user)
        if not student:
            return Response(
                envelope(False, 'Student profile required.', errors={'profile': ['Not found']}),
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = InterviewSessionStartSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(envelope(False, 'Validation error', errors=serializer.errors), status=400)
        try:
            data = start_session(student=student, payload=serializer.validated_data)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, 'Interview session started', data=data))


class InterviewSessionAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_uuid):
        student = _get_student_profile(request.user)
        if not student:
            return Response(envelope(False, 'Student profile required.'), status=status.HTTP_403_FORBIDDEN)
        serializer = InterviewAnswerSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(envelope(False, 'Validation error', errors=serializer.errors), status=400)
        try:
            data = submit_answer(student=student, session_uuid=str(session_uuid), payload=serializer.validated_data)
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, 'Answer processed', data=data))


class InterviewSessionCompleteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, session_uuid):
        student = _get_student_profile(request.user)
        if not student:
            return Response(envelope(False, 'Student profile required.'), status=status.HTTP_403_FORBIDDEN)
        try:
            data = complete_session(student=student, session_uuid=str(session_uuid))
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=400)
        return Response(envelope(True, 'Interview completed', data=data))


class InterviewSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = _get_student_profile(request.user)
        if not student:
            return Response(envelope(False, 'Student profile required.'), status=status.HTTP_403_FORBIDDEN)
        return Response(envelope(True, 'Interview history loaded', data=list_sessions(student=student)))


class InterviewSessionHubStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        student = _get_student_profile(request.user)
        if not student:
            return Response(envelope(False, 'Student profile required.'), status=status.HTTP_403_FORBIDDEN)
        return Response(envelope(True, 'Interview hub stats loaded', data=get_hub_stats(student=student)))


class InterviewSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_uuid):
        student = _get_student_profile(request.user)
        if not student:
            return Response(envelope(False, 'Student profile required.'), status=status.HTTP_403_FORBIDDEN)
        try:
            data = get_session_detail(student=student, session_uuid=str(session_uuid))
        except ValueError as exc:
            return Response(envelope(False, str(exc)), status=404)
        return Response(envelope(True, 'Interview session loaded', data=data))


class InterviewAudioTranscribeView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        student = _get_student_profile(request.user)
        if not student:
            return Response(envelope(False, 'Student profile required.'), status=status.HTTP_403_FORBIDDEN)

        serializer = InterviewAudioTranscribeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(envelope(False, 'Validation error', errors=serializer.errors), status=400)

        audio = serializer.validated_data['audio']
        language = serializer.validated_data.get('language') or ''
        try:
            data = transcribe_audio(audio, language=language)
        except Exception as exc:
            return Response(
                envelope(False, f'Audio transcription failed: {exc}'),
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return Response(envelope(True, 'Audio transcribed', data=data))

