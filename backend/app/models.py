# app/models.py
from django.db import models
from django.contrib.auth import get_user_model
from datetime import date, timedelta

User = get_user_model()


class Category(models.Model):
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.name


class Author(models.Model):
    name        = models.CharField(max_length=100)
    biography   = models.TextField(blank=True, null=True)
    nationality = models.CharField(max_length=50, blank=True, null=True)
    
    def __str__(self):
        return self.name


class Book(models.Model):
    title            = models.CharField(max_length=200)
    isbn             = models.CharField(max_length=20, unique=True)
    publication_year = models.IntegerField()
    author           = models.ForeignKey(Author, on_delete=models.CASCADE)
    category         = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    available        = models.BooleanField(default=True)
    cover_image      = models.ImageField(upload_to='book_covers/', null=True, blank=True)
    description      = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return self.title


class Loan(models.Model):
    RETURN_STATUS_CHOICES = [
        ('none',     'No Request'),
        ('pending',  'Pending Return'),
        ('verified', 'Returned & Verified'),
        ('rejected', 'Return Rejected'),
        ('disputed', 'Disputed'),
    ]
    
    user                   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='loans')
    book                   = models.ForeignKey(Book, on_delete=models.CASCADE)
    loan_date              = models.DateField(auto_now_add=True)
    due_date               = models.DateField()
    return_date            = models.DateField(null=True, blank=True)
    return_requested_date  = models.DateField(null=True, blank=True)
    return_verified_date   = models.DateField(null=True, blank=True)
    return_status          = models.CharField(max_length=20, choices=RETURN_STATUS_CHOICES, default='none')
    verified_by            = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='verified_returns'
    )
    notes = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.book.title}"
    
    @property
    def is_overdue(self):
        if self.return_date:
            return False
        return date.today() > self.due_date
    
    @property
    def overdue_days(self):
        if self.return_date or not self.is_overdue:
            return 0
        return (date.today() - self.due_date).days


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('waiting',   'Waiting'),
        ('ready',     'Ready to Borrow'),
        ('cancelled', 'Cancelled'),
        ('expired',   'Expired'),
        ('fulfilled', 'Fulfilled'),
    ]
    
    user           = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    book           = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='reservations')
    reserved_date  = models.DateField(auto_now_add=True)
    status         = models.CharField(max_length=20, choices=STATUS_CHOICES, default='waiting')
    queue_position = models.PositiveIntegerField(default=1)
    notified_date  = models.DateField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'book', 'status')
        ordering = ['reserved_date']
    
    def __str__(self):
        return f"{self.user.username} reserved {self.book.title} - {self.get_status_display()}"


class Fine(models.Model):
    user   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fines')
    loan   = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='fines')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paid   = models.BooleanField(default=False)
    paid_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.username} - ${self.amount}"