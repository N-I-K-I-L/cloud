import io
import json
import zipfile

from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.staticfiles import finders
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from apps.resume_parser.services import parse_resume
from apps.web.views import _normalize_template_data
from .models import Portfolio
from .serializers import (
    PortfolioSerializer,
    PortfolioUploadSerializer,
    PortfolioManualCreateSerializer,
)


class PortfolioViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    serializer_class = PortfolioSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload(self, request):
        serializer = PortfolioUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        resume_file = serializer.validated_data['resume']
        template_id = serializer.validated_data['template_id']

        portfolio = Portfolio.objects.create(
            user=request.user,
            template_id=template_id,
            resume_file=resume_file,
            portfolio_data_json={},
        )

        try:
            parsed_data = parse_resume(portfolio.resume_file.path)
        except Exception as exc:
            portfolio.delete()
            return Response({'detail': f'Failed to parse resume: {str(exc)}'}, status=status.HTTP_400_BAD_REQUEST)

        portfolio.portfolio_data_json = parsed_data
        portfolio.save(update_fields=['portfolio_data_json', 'updated_at'])
        return Response(PortfolioSerializer(portfolio).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def manual(self, request):
        serializer = PortfolioManualCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        template_id = serializer.validated_data['template_id']
        manual_data = {
            'name': request.user.get_full_name() or request.user.username,
            'about': '',
            'skills': [],
            'technologies': [],
            'projects': [],
            'education': [],
            'work_experience': [],
            'contact': {'email': request.user.email or '', 'phone': '', 'links': []},
        }

        portfolio = Portfolio.objects.create(
            user=request.user,
            template_id=template_id,
            portfolio_data_json=manual_data,
        )
        return Response(PortfolioSerializer(portfolio).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        portfolio = self.get_object()
        incoming_data = request.data.get('portfolio_data_json')
        if incoming_data:
            portfolio.portfolio_data_json = incoming_data
            portfolio.save(update_fields=['portfolio_data_json', 'updated_at'])

        Portfolio.objects.filter(user=request.user, is_published=True).update(is_published=False)
        portfolio.is_published = True
        portfolio.save(update_fields=['is_published', 'updated_at'])
        public_url = request.build_absolute_uri(f'/portfolio/{request.user.username}')
        return Response(
            {
                'detail': 'Portfolio published successfully.',
                'public_url': public_url,
                'username': request.user.username,
            }
        )

    @action(detail=True, methods=['get'])
    def export_files(self, request, pk=None):
        portfolio = self.get_object()
        data = portfolio.portfolio_data_json if isinstance(portfolio.portfolio_data_json, dict) else {}
        template_id = portfolio.template_id or 'minimal'
        username = request.user.username
        template_data = _normalize_template_data(data, username)

        html = render_to_string(
            'web/export_portfolio.html',
            {
                'username': username,
                'template_id': template_id,
                'data': data,
                'template_data': template_data,
            },
        )

        css_path = finders.find('web/styles.css')
        css_text = ''
        if css_path:
            with open(css_path, 'r', encoding='utf-8') as f:
                css_text = f.read()

        readme = (
            "Portfolio Export\n\n"
            "Files included:\n"
            "- index.html\n"
            "- assets/styles.css\n"
            "- portfolio-data.json\n\n"
            "How to run locally:\n"
            "1. Extract this ZIP.\n"
            "2. Open index.html directly in browser.\n"
            "3. Optional: host via static server:\n"
            "   - Python: python -m http.server 8080\n"
            "   - Then open http://127.0.0.1:8080\n"
        )

        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('index.html', html)
            zf.writestr('assets/styles.css', css_text)
            zf.writestr('portfolio-data.json', json.dumps(data, indent=2))
            zf.writestr('README.txt', readme)
        buffer.seek(0)

        filename = f"{request.user.username}-portfolio.zip"
        response = HttpResponse(buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response


class PublicPortfolioView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PortfolioSerializer
    lookup_field = 'username'

    def get_object(self):
        username = self.kwargs['username']
        try:
            user = User.objects.get(username=username)
        except ObjectDoesNotExist:
            return None

        return Portfolio.objects.filter(user=user, is_published=True).order_by('-updated_at').first()

    def retrieve(self, request, *args, **kwargs):
        portfolio = self.get_object()
        if not portfolio:
            return Response({'detail': 'No published portfolio found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(PortfolioSerializer(portfolio).data)
