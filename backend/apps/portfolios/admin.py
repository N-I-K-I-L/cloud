from django.contrib import admin
from .models import Portfolio


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'template_id', 'is_published', 'updated_at')
    search_fields = ('user__username', 'user__email')
    list_filter = ('template_id', 'is_published')
