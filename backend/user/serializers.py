# user/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from djoser.serializers import UserCreateSerializer as DjoserUserCreateSerializer
from djoser.serializers import UserSerializer as DjoserUserSerializer
from .models import User, UserProfile


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_picture', 'phone_number', 'address', 'bio', 'membership_id']
        read_only_fields = ['membership_id']


class UserCreateSerializer(DjoserUserCreateSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta(DjoserUserCreateSerializer.Meta):
        model = User
        fields = [
            'id', 'email', 'username', 'full_name', 'birthday', 'sex',
            'password', 'password2', 'role'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.is_active = False
        user.save()
        
        UserProfile.objects.create(user=user)
        
        return user


class UserSerializer(DjoserUserSerializer):
    profile = UserProfileSerializer(read_only=True)
    age = serializers.ReadOnlyField()
    
    class Meta(DjoserUserSerializer.Meta):
        model = User
        fields = [
            'id', 'email', 'username', 'full_name', 'role', 
            'birthday', 'age', 'sex', 'date_joined', 'profile'
        ]


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['full_name', 'birthday', 'sex']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['profile_picture', 'phone_number', 'address', 'bio']


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match"})
        return attrs