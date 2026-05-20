from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from .models import Category, Author, Book, Loan, Reservation, Fine
from user.models import User

from .serializers import (
    CategorySerializer, AuthorSerializer, BookSerializer,
    LoanSerializer, LoanCreateSerializer, LoanReturnRequestSerializer,
    LoanReturnVerifySerializer, ReservationSerializer, ReservationCreateSerializer,
    FineSerializer
)

# ==================== CATEGORY VIEWS ====================

class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


class CategoryRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]


# ==================== AUTHOR VIEWS ====================

class AuthorListCreateAPIView(generics.ListCreateAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated]


class AuthorRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    permission_classes = [IsAuthenticated]


# ==================== BOOK VIEWS ====================

class BookListCreateAPIView(generics.ListCreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Book.objects.all()
        # Optional filtering
        author_id = self.request.query_params.get('author')
        category_id = self.request.query_params.get('category')
        available = self.request.query_params.get('available')
        
        if author_id:
            queryset = queryset.filter(author_id=author_id)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if available:
            queryset = queryset.filter(available=available.lower() == 'true')
        
        return queryset


class BookRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    permission_classes = [IsAuthenticated]


# ==================== LOAN VIEWS ====================

class LoanListCreateAPIView(generics.ListCreateAPIView):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Regular users see only their own loans
        if user.role == 'member':
            return Loan.objects.filter(user=user)
        # Librarians and admins see all loans
        return Loan.objects.all()
    
    def create(self, request, *args, **kwargs):
        serializer = LoanCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Set due date (14 days from now)
            due_date = timezone.now().date() + timedelta(days=14)
            
            loan = Loan.objects.create(
                user=serializer.validated_data['user'],
                book=serializer.validated_data['book'],
                due_date=due_date
            )
            
            # Update book availability
            book = loan.book
            book.available = False
            book.save()
            
            return Response(
                LoanSerializer(loan).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoanRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Loan.objects.all()
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]


# ==================== LOAN RETURN VIEWS ====================

class LoanReturnRequestAPIView(generics.GenericAPIView):
    serializer_class = LoanReturnRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            loan_id = serializer.validated_data['loan_id']
            loan = get_object_or_404(Loan, id=loan_id)
            
            # Check if loan belongs to user
            if loan.user != request.user and request.user.role not in ['admin', 'librarian']:
                return Response(
                    {'error': 'You can only request return for your own loans'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if loan is already returned
            if loan.return_status in ['verified']:
                return Response(
                    {'error': 'Book already returned'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            loan.return_requested_date = timezone.now().date()
            loan.return_status = 'pending'
            loan.notes = serializer.validated_data.get('notes', '')
            loan.save()
            
            return Response(
                LoanSerializer(loan).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoanReturnVerifyAPIView(generics.GenericAPIView):
    serializer_class = LoanReturnVerifySerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Only librarians and admins can verify returns
        if request.user.role not in ['admin', 'librarian']:
            return Response(
                {'error': 'Only librarians and admins can verify returns'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            loan_id = serializer.validated_data['loan_id']
            status_choice = serializer.validated_data['status']
            loan = get_object_or_404(Loan, id=loan_id)
            
            if status_choice == 'verified':
                loan.return_date = timezone.now().date()
                loan.return_verified_date = timezone.now().date()
                loan.return_status = 'verified'
                loan.verified_by = request.user
                
                # Make book available again
                book = loan.book
                book.available = True
                book.save()
                
                # Calculate fine if overdue
                if loan.is_overdue:
                    Fine.objects.create(
                        user=loan.user,
                        loan=loan,
                        amount=loan.overdue_days * 10,  # $10 per day
                        paid=False
                    )
            
            elif status_choice == 'rejected':
                loan.return_status = 'rejected'
                loan.return_requested_date = None
            
            elif status_choice == 'disputed':
                loan.return_status = 'disputed'
            
            if serializer.validated_data.get('notes'):
                loan.notes = serializer.validated_data['notes']
            
            loan.save()
            
            return Response(
                LoanSerializer(loan).data,
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==================== RESERVATION VIEWS ====================

class ReservationListCreateAPIView(generics.ListCreateAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'member':
            return Reservation.objects.filter(user=user)
        return Reservation.objects.all()
    
    def create(self, request, *args, **kwargs):
        serializer = ReservationCreateSerializer(data=request.data)
        if serializer.is_valid():
            book = serializer.validated_data['book']
            
            # Check if book is available
            if book.available:
                return Response(
                    {'error': 'Book is available for borrowing, no need to reserve'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if user already has a reservation for this book
            existing_reservation = Reservation.objects.filter(
                user=serializer.validated_data['user'],
                book=book,
                status='waiting'
            ).exists()
            
            if existing_reservation:
                return Response(
                    {'error': 'You already have a reservation for this book'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set queue position
            last_reservation = Reservation.objects.filter(book=book).order_by('-queue_position').first()
            queue_position = (last_reservation.queue_position + 1) if last_reservation else 1
            
            reservation = Reservation.objects.create(
                user=serializer.validated_data['user'],
                book=book,
                queue_position=queue_position
            )
            
            return Response(
                ReservationSerializer(reservation).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReservationRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, *args, **kwargs):
        reservation = self.get_object()
        
        # Only the user who made the reservation or admin/librarian can cancel
        if reservation.user != request.user and request.user.role not in ['admin', 'librarian']:
            return Response(
                {'error': 'You cannot cancel this reservation'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        reservation.status = 'cancelled'
        reservation.save()
        
        return Response(
            {'message': 'Reservation cancelled successfully'},
            status=status.HTTP_200_OK
        )


# ==================== FINE VIEWS ====================

class FineListAPIView(generics.ListAPIView):
    serializer_class = FineSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'member':
            return Fine.objects.filter(user=user, paid=False)
        return Fine.objects.all()


class FinePayAPIView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        fine = get_object_or_404(Fine, id=pk)
        
        # Check if fine belongs to user
        if fine.user != request.user and request.user.role not in ['admin', 'librarian']:
            return Response(
                {'error': 'You cannot pay this fine'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if fine.paid:
            return Response(
                {'error': 'Fine already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        fine.paid = True
        fine.paid_date = timezone.now().date()
        fine.save()
        
        return Response(
            {'message': 'Fine paid successfully', 'amount': fine.amount},
            status=status.HTTP_200_OK
        )


# ==================== DASHBOARD STATS VIEWS ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Get dashboard statistics for admin/librarian"""
    if request.user.role not in ['admin', 'librarian']:
        return Response(
            {'error': 'Access denied'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    stats = {
        'total_books': Book.objects.count(),
        'available_books': Book.objects.filter(available=True).count(),
        'total_authors': Author.objects.count(),
        'active_loans': Loan.objects.filter(return_status='none', return_verified_date__isnull=True).count(),
        'pending_returns': Loan.objects.filter(return_status='pending').count(),
        'overdue_loans': Loan.objects.filter(return_status='none').exclude(due_date__gte=timezone.now().date()).count(),
        'active_reservations': Reservation.objects.filter(status='waiting').count(),
        'unpaid_fines': Fine.objects.filter(paid=False).count(),

        # User role counts
        'total_users': User.objects.count(),
        'user_admins': User.objects.filter(role='admin').count(),
        'user_librarians': User.objects.filter(role='librarian').count(),
        'user_members': User.objects.filter(role='member').count(),
    }

    
    return Response(stats)