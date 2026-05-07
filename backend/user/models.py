# user/models.py
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone
from datetime import date

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'admin')
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('librarian', 'Librarian'),
        ('member', 'Member'),
    ]
    
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]
    
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)
    full_name = models.CharField(max_length=255)  # Added full name
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    
    # New fields
    birthday = models.DateField(null=True, blank=True)
    sex = models.CharField(max_length=1, choices=SEX_CHOICES, blank=True)
    
    is_active = models.BooleanField(default=False)  # False until email verification
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'full_name']
    
    class Meta:
        db_table = 'users'
    
    def __str__(self):
        return self.email
    
    @property
    def age(self):
        """Calculate age from birthday"""
        if self.birthday:
            today = date.today()
            return today.year - self.birthday.year - (
                (today.month, today.day) < (self.birthday.month, self.birthday.day)
            )
        return None


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    membership_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    
    class Meta:
        db_table = 'user_profiles'
    
    def __str__(self):
        return f"Profile of {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.membership_id and self.user.role == 'member':
            self.membership_id = f"MEM{self.user.id:06d}"
        super().save(*args, **kwargs)