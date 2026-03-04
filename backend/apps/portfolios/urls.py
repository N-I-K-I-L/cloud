from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, PublicPortfolioView

router = DefaultRouter()
router.register('', PortfolioViewSet, basename='portfolio')

urlpatterns = [
    path('public/<str:username>/', PublicPortfolioView.as_view(), name='public-portfolio'),
    path('', include(router.urls)),
]
