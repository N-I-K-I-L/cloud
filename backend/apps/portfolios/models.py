from django.db import models
from django.contrib.auth.models import User


class Portfolio(models.Model):
    TEMPLATE_CHOICES = [
        ('minimal', 'Minimal Developer Template'),
        ('dark', 'Dark Developer Theme'),
        ('cards', 'Modern Card Layout'),
        ('professional', 'Professional Template'),
        ('creative', 'Creative Template'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    template_id = models.CharField(max_length=20, choices=TEMPLATE_CHOICES, default='minimal')
    resume_file = models.FileField(upload_to='resumes/', null=True, blank=True)
    portfolio_data_json = models.JSONField(default=dict)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f'{self.user.username} - {self.id}'
