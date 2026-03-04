from rest_framework import serializers
from .models import Portfolio


class PortfolioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Portfolio
        fields = (
            'id',
            'username',
            'template_id',
            'resume_file',
            'portfolio_data_json',
            'is_published',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'username', 'created_at', 'updated_at')


class PortfolioUploadSerializer(serializers.Serializer):
    resume = serializers.FileField()
    template_id = serializers.ChoiceField(choices=Portfolio.TEMPLATE_CHOICES, default='minimal')

    def validate_resume(self, value):
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('Only PDF files are supported.')
        return value


class PortfolioManualCreateSerializer(serializers.Serializer):
    template_id = serializers.ChoiceField(choices=Portfolio.TEMPLATE_CHOICES, default='minimal')
