from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)

    # Substitui o campo username por email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'username']  

    # Adiciona related_name para evitar conflitos com o modelo auth.User
    groups = models.ManyToManyField(Group, related_name="custom_users", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="custom_users_permissions", blank=True)

    def __str__(self):
        return self.username
