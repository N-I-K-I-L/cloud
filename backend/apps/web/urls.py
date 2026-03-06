from django.urls import path
from . import views


urlpatterns = [
    path('', views.landing_page, name='landing'),
    path('login/', views.login_page, name='login-page'),
    path('register/', views.register_page, name='register-page'),
    path('dashboard/', views.dashboard_page, name='dashboard-page'),
    path('upload-resume/', views.upload_resume_page, name='upload-resume-page'),
    path('upload-resume/template/', views.upload_template_page, name='upload-template-page'),
    path('upload-resume/import-data/', views.upload_import_data_page, name='upload-import-data-page'),
    path('upload-resume/upload/', views.upload_file_page, name='upload-file-page'),
    path('editor/<int:portfolio_id>/', views.editor_page, name='editor-page'),
    path('portfolio/<str:username>/', views.public_portfolio_page, name='public-portfolio-page'),
]
