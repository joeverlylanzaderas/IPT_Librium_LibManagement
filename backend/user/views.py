from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import User, UserProfile
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    UserProfileUpdateSerializer, ChangePasswordSerializer
)
from app.permissions import IsAdminOrLibrarian


# ==================== USER VIEWS ====================

class UserListCreateAPIView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrLibrarian]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(role='member')
    
    def create(self, request, *args, **kwargs):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(
                UserSerializer(user).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrLibrarian]


class CurrentUserRetrieveUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        
        # Update user basic info (including birthday, sex)
        user_serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        user_serializer.is_valid(raise_exception=True)
        user_serializer.save()
        
        # Update profile info if provided
        if 'profile' in request.data:
            profile = user.profile
            profile_serializer = UserProfileUpdateSerializer(profile, data=request.data['profile'], partial=True)
            profile_serializer.is_valid(raise_exception=True)
            profile_serializer.save()
        
        return Response(UserSerializer(user).data)


class ChangePasswordAPIView(generics.GenericAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if not user.check_password(serializer.data.get('old_password')):
                return Response(
                    {'old_password': 'Wrong password'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.set_password(serializer.data.get('new_password'))
            user.save()
            return Response({'message': 'Password changed successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)