# app/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Category, Author, Book, Loan, Reservation, Fine

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = '__all__'


class BookSerializer(serializers.ModelSerializer):
    author_name = serializers.ReadOnlyField(source='author.name')
    category_name = serializers.ReadOnlyField(source='category.name', allow_null=True)
    
    class Meta:
        model = Book
        fields = [
            'id', 'title', 'isbn', 'publication_year', 
            'author', 'author_name', 'category', 'category_name',
            'available', 'cover_image', 'cover_image_url', 'description'
        ]


class LoanSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    book_title = serializers.ReadOnlyField(source='book.title')
    verified_by_name = serializers.ReadOnlyField(source='verified_by.username', allow_null=True)
    is_overdue = serializers.ReadOnlyField()
    overdue_days = serializers.ReadOnlyField()
    
    class Meta:
        model = Loan
        fields = [
            'id', 'user', 'user_name', 'book', 'book_title',
            'loan_date', 'due_date', 'return_date', 
            'return_requested_date', 'return_verified_date', 
            'return_status', 'verified_by', 'verified_by_name',
            'notes', 'is_overdue', 'overdue_days'
        ]
        read_only_fields = ['loan_date']


class LoanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = ['user', 'book', 'due_date']


class LoanReturnRequestSerializer(serializers.Serializer):
    loan_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)


class LoanReturnVerifySerializer(serializers.Serializer):
    loan_id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=['verified', 'rejected', 'disputed'])
    notes = serializers.CharField(required=False, allow_blank=True)


class ReservationSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    book_title = serializers.ReadOnlyField(source='book.title')
    
    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'user_name', 'book', 'book_title',
            'reserved_date', 'status', 'queue_position', 
            'notified_date'
        ]
        read_only_fields = ['reserved_date', 'queue_position']


class ReservationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['user', 'book']


class FineSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    book_title = serializers.ReadOnlyField(source='loan.book.title')
    
    class Meta:
        model = Fine
        fields = ['id', 'user', 'user_name', 'loan', 'book_title', 'amount', 'paid', 'paid_date']