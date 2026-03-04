from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from apps.resume_parser.services import parse_resume
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
