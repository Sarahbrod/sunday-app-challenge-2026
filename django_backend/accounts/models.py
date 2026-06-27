import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .managers import UserManager


ACCOUNT_TYPE_CHOICES = [
    ("solo", "Solo Creator"),
    ("creator", "Full-Time Creator"),
    ("agency", "Agency"),
    ("business", "Business"),
]


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    account_type = models.CharField(
        max_length=20, choices=ACCOUNT_TYPE_CHOICES, default="solo"
    )
    interests = models.JSONField(default=list, blank=True)
    email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_suspended = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    class Meta:
        db_table = "accounts_user"

    def __str__(self):
        return self.email
