from rest_framework import status
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError, PermissionDenied

from .serializers import (
    CompleteStudentProfileSerializer,
    ConfirmIdentitySerializer,
    StudentProfileSerializer,
    UserProfileSerializer,
    UserSerializer,
)
from .services import (
    confirm_identity,
    complete_student_profile,
)
from .models import User


def envelope(success: bool, message: str = '', data=None, errors=None):
    """Standard API response envelope."""
    response = {
        'success': success,
        'message': message,
    }
    if data is not None:
        response['data'] = data
    if errors is not None:
        response['errors'] = errors
    return response


class ConfirmIdentityApiView(APIView):
    """
    Step 1: Confirm basic identity (first_name, last_name, date_of_birth).
    Writes to UserProfile.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            # Check if user is a student
            if request.user.role != User.RoleChoices.STUDENT:
                return Response(
                    envelope(
                        success=False,
                        message='Only students can confirm identity through this endpoint.',
                        errors={'role': ['This endpoint is only for students.']}
                    ),
                    status=status.HTTP_403_FORBIDDEN
                )

            # Validate input
            serializer = ConfirmIdentitySerializer(data=request.data)
            try:
                serializer.is_valid(raise_exception=True)
            except ValidationError as e:
                return Response(
                    envelope(
                        success=False,
                        message='Validation failed. Please check your input.',
                        errors=e.detail
                    ),
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if identity is already confirmed (optional: prevent re-confirmation)
            student_profile = getattr(request.user, 'student_profile', None)
            if student_profile and student_profile.identity_confirmed:
                # Allow updates even if already confirmed, but you could restrict this
                pass

            # Process identity confirmation
            confirm_identity(user=request.user, data=serializer.validated_data)

            # Refresh user from DB to get updated profile data
            request.user.refresh_from_db()
            if hasattr(request.user, 'profile'):
                request.user.profile.refresh_from_db()
            if hasattr(request.user, 'student_profile'):
                request.user.student_profile.refresh_from_db()

            return Response(
                envelope(
                    success=True,
                    message='Identity confirmed successfully.',
                    data=UserSerializer(request.user).data
                ),
                status=status.HTTP_200_OK
            )

        except PermissionDenied as e:
            return Response(
                envelope(
                    success=False,
                    message=str(e) or 'You do not have permission to perform this action.'
                ),
                status=status.HTTP_403_FORBIDDEN
            )
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f'Error in ConfirmIdentityApiView: {str(e)}', exc_info=True)

            return Response(
                envelope(
                    success=False,
                    message='An error occurred while processing your request. Please try again later.'
                ),
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CompleteProfileApiView(APIView):
    """
    Step 2: Complete role-specific profile.
    For students: program_major, current_class, linkedin_url, etc.
    """
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def patch(self, request):
        serializer = CompleteStudentProfileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = complete_student_profile(
            user=request.user,
            data=serializer.validated_data,
            cv_file=request.FILES.get('cv_file'),
        )
        return Response(StudentProfileSerializer(profile).data)
