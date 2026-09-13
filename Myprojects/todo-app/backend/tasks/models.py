from django.contrib.auth.models import User
User.objects.values("id", "username")
from django.db import models


class Task(models.Model):
    user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    priority = models.CharField(
    max_length=20,
    choices=[
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    ],
    default="medium"
    )
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title