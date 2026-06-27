from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "name", "account_type", "email_verified", "is_active", "created_at"]
    list_filter = ["account_type", "email_verified", "is_active", "is_suspended"]
    search_fields = ["email", "name"]
    ordering = ["-created_at"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Profile", {"fields": ("name", "account_type", "interests")}),
        ("Status", {"fields": ("email_verified", "is_active", "is_suspended", "is_staff", "is_superuser")}),
        ("Dates", {"fields": ("last_login", "created_at", "updated_at")}),
    )
    readonly_fields = ["created_at", "updated_at"]
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "account_type", "password1", "password2"),
        }),
    )
