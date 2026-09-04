import logging

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.authentication.utils import envelope
from apps.report_reviewer.serializers import AnalyzePageSerializer
from apps.report_reviewer.services.analysis_service import ReportReviewerError, analyze_page

logger = logging.getLogger(__name__)


class AnalyzePageView(APIView):
    """Analyze a single PFE report page (payload from client; no full-document DB)."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AnalyzePageSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                envelope(False, 'Invalid analysis request.', errors=serializer.errors),
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = serializer.validated_data
        force = str(request.data.get('force', '')).lower() in ('1', 'true', 'yes')

        logger.info(
            'analyze-page user=%s reportId=%s page=%s mode=%s hash=%s',
            getattr(request.user, 'pk', None),
            data['reportId'],
            data['pageNumber'],
            data['mode'],
            str(data['contentHash'])[:12],
        )

        try:
            result = analyze_page(
                user=request.user,
                report_id=data['reportId'],
                page_number=data['pageNumber'],
                page_id=data['pageId'],
                content_hash=data['contentHash'],
                mode=data['mode'],
                include_context=data.get('includeContext', True),
                page=data['page'],
                context=data.get('context') or {},
                force=force,
            )
        except ReportReviewerError as exc:
            return Response(
                envelope(False, exc.message, errors={'code': [exc.code]}),
                status=status.HTTP_503_SERVICE_UNAVAILABLE
                if exc.code.startswith('ollama')
                else status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            logger.exception(
                'analyze-page unexpected error reportId=%s page=%s',
                data.get('reportId'),
                data.get('pageNumber'),
            )
            return Response(
                envelope(
                    False,
                    'Impossible d\'analyser cette page. Vérifiez la connexion au service IA.',
                    errors={'code': ['internal_error']},
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            envelope(True, 'Page analysis completed.', data=result),
            status=status.HTTP_200_OK,
        )
