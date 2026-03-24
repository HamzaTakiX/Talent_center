from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser

from .serializers import (
    LoginSerializer, UserSerializer, 
    ConfirmIdentitySerializer, CompleteProfileSerializer,
    StudentProfileSerializer
)
from .services import perform_login, confirm_identity, complete_profile

class LoginApiView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user, token = perform_login(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        # user_data inherently includes 'student_profile' which inherently contains the onboarding state
        user_data = UserSerializer(user).data
        return Response({
            'token': token,
            'user': user_data
        }, status=status.HTTP_200_OK)

class MeApiView(APIView):
    """
    Returns the current authenticated user's profile and onboarding state.
    """
    # NOTE: Set to AllowAny for local dev placeholder tests, strictly should be IsAuthenticated
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user_data = UserSerializer(request.user).data
        return Response(user_data, status=status.HTTP_200_OK)

class ConfirmIdentityApiView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        serializer = ConfirmIdentitySerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        profile = confirm_identity(user=request.user, data=serializer.validated_data)
        
        return Response(StudentProfileSerializer(profile).data, status=status.HTTP_200_OK)

class CompleteProfileApiView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def patch(self, request):
        serializer = CompleteProfileSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        cv_file = request.FILES.get('cv_file', None)
        
        profile = complete_profile(
            user=request.user, 
            data=serializer.validated_data,
            cv_file=cv_file
        )
        
        return Response(StudentProfileSerializer(profile).data, status=status.HTTP_200_OK)
