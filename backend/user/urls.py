# user/urls.py
from django.urls import path, include
from . import views

urlpatterns = [
    # User CRUD
    path('users/', views.UserListCreateAPIView.as_view(), name='user-list-create'),
    path('users/<int:pk>/', views.UserRetrieveUpdateDestroyAPIView.as_view(), name='user-detail'),
    
    # Current user
    path('users/me/', views.CurrentUserRetrieveUpdateAPIView.as_view(), name='current-user'),
    path('users/change-password/', views.ChangePasswordAPIView.as_view(), name='change-password'),
    
    # Djoser authentication (email verification)
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
]