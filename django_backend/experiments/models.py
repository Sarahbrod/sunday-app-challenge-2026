import uuid
from django.db import models
from django.conf import settings


class ExperimentTemplate(models.Model):
    """Seed data — reusable experiment blueprints shown in the library."""
    DIFFICULTY_EASY = "Easy"
    DIFFICULTY_MEDIUM = "Medium"
    DIFFICULTY_HARD = "Hard"
    DIFFICULTY_CHOICES = [
        (DIFFICULTY_EASY, "Easy"),
        (DIFFICULTY_MEDIUM, "Medium"),
        (DIFFICULTY_HARD, "Hard"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    icon = models.CharField(max_length=64, blank=True)
    category = models.CharField(max_length=64, blank=True)
    success_metric = models.CharField(max_length=255, blank=True)
    avg_impact = models.CharField(max_length=64, blank=True)
    time_to_result = models.CharField(max_length=64, blank=True)
    difficulty = models.CharField(max_length=16, choices=DIFFICULTY_CHOICES, default=DIFFICULTY_MEDIUM)
    rationale = models.TextField(blank=True)

    class Meta:
        db_table = "experiments_template"

    def __str__(self):
        return self.name


class Experiment(models.Model):
    STATUS_ACTIVE = "ACTIVE"
    STATUS_COMPLETED = "COMPLETED"
    STATUS_DRAFT = "DRAFT"
    STATUS_CHOICES = [
        (STATUS_ACTIVE, "Active"),
        (STATUS_COMPLETED, "Completed"),
        (STATUS_DRAFT, "Draft"),
    ]

    SIGNAL_UP = "up"
    SIGNAL_DOWN = "down"
    SIGNAL_NEUTRAL = "neutral"
    SIGNAL_CHOICES = [
        (SIGNAL_UP, "Up"),
        (SIGNAL_DOWN, "Down"),
        (SIGNAL_NEUTRAL, "Neutral"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="experiments",
    )
    template = models.ForeignKey(
        ExperimentTemplate,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="instances",
    )
    title = models.CharField(max_length=255)
    hypothesis = models.TextField(blank=True)
    variable = models.CharField(max_length=255, blank=True)
    success_metric = models.CharField(max_length=255, blank=True)
    creator_name = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    signal = models.CharField(max_length=16, choices=SIGNAL_CHOICES, default=SIGNAL_NEUTRAL)
    current_lift = models.CharField(max_length=32, blank=True)
    days_running = models.IntegerField(default=0)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "experiments_experiment"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.user.email})"


class ExperimentResult(models.Model):
    WINNER_VARIANT = "variant"
    WINNER_CONTROL = "control"
    WINNER_INCONCLUSIVE = "inconclusive"
    WINNER_CHOICES = [
        (WINNER_VARIANT, "Variant"),
        (WINNER_CONTROL, "Control"),
        (WINNER_INCONCLUSIVE, "Inconclusive"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    experiment = models.OneToOneField(
        Experiment, on_delete=models.CASCADE, related_name="result"
    )
    winner = models.CharField(max_length=20, choices=WINNER_CHOICES)
    baseline = models.FloatField(default=0)
    result_value = models.FloatField(default=0)
    lift = models.CharField(max_length=32, blank=True)
    significance = models.FloatField(default=0)
    metric_unit = models.CharField(max_length=64, blank=True)
    # AI analysis sections
    what_happened = models.TextField(blank=True)
    why_it_may_have = models.TextField(blank=True)
    what_we_learned = models.TextField(blank=True)
    what_to_test_next = models.TextField(blank=True)
    completed_date = models.CharField(max_length=32, blank=True)

    class Meta:
        db_table = "experiments_result"

    def __str__(self):
        return f"Result for {self.experiment.title}"
