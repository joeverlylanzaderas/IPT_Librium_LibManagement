# app/urls.py
from django.urls import path
from . import views

urlpatterns = [
    # Category URLs
    path('categories/', views.CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', views.CategoryRetrieveUpdateDestroyAPIView.as_view(), name='category-detail'),
    
    # Author URLs
    path('authors/', views.AuthorListCreateAPIView.as_view(), name='author-list-create'),
    path('authors/<int:pk>/', views.AuthorRetrieveUpdateDestroyAPIView.as_view(), name='author-detail'),
    
    # Book URLs
    path('books/', views.BookListCreateAPIView.as_view(), name='book-list-create'),
    path('books/<int:pk>/', views.BookRetrieveUpdateDestroyAPIView.as_view(), name='book-detail'),
    
    # Loan URLs
    path('loans/', views.LoanListCreateAPIView.as_view(), name='loan-list-create'),
    path('loans/<int:pk>/', views.LoanRetrieveUpdateDestroyAPIView.as_view(), name='loan-detail'),
    
    # Loan Return URLs
    path('loans/return-request/', views.LoanReturnRequestAPIView.as_view(), name='loan-return-request'),
    path('loans/return-verify/', views.LoanReturnVerifyAPIView.as_view(), name='loan-return-verify'),
    
    # Reservation URLs
    path('reservations/', views.ReservationListCreateAPIView.as_view(), name='reservation-list-create'),
    path('reservations/<int:pk>/', views.ReservationRetrieveUpdateDestroyAPIView.as_view(), name='reservation-detail'),
    
    # Fine URLs
    path('fines/', views.FineListAPIView.as_view(), name='fine-list'),
    path('fines/<int:pk>/pay/', views.FinePayAPIView.as_view(), name='fine-pay'),
    
    # Dashboard URLs
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),
]