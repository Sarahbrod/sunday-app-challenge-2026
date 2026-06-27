from django.contrib import admin
from .models import Experiment, ExperimentResult, ExperimentTemplate


@admin.register(ExperimentTemplate)
class ExperimentTemplateAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "difficulty", "avg_impact", "time_to_result"]
    list_filter = ["category", "difficulty"]
    search_fields = ["name"]


class ExperimentResultInline(admin.StackedInline):
    model = ExperimentResult
    extra = 0


@admin.register(Experiment)
class ExperimentAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "creator_name", "status", "signal", "days_running", "created_at"]
    list_filter = ["status", "signal"]
    search_fields = ["title", "user__email", "creator_name"]
    inlines = [ExperimentResultInline]
    readonly_fields = ["created_at", "updated_at"]
