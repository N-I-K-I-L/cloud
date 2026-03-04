from django.urls import path
from . import views


urlpatterns = [
    path('', views.landing_page, name='landing'),
    path('login/', views.login_page, name='login-page'),
    path('register/', views.register_page, name='register-page'),
    path('dashboard/', views.dashboard_page, name='dashboard-page'),
    path('upload-resume/', views.upload_resume_page, name='upload-resume-page'),
    path('editor/<int:portfolio_id>/', views.editor_page, name='editor-page'),
    path('portfolio/<str:username>/', views.public_portfolio_page, name='public-portfolio-page'),
]

