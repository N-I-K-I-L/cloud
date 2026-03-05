from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, render

from apps.portfolios.models import Portfolio


def _normalize_template_data(data: dict, username: str) -> dict:
    if not isinstance(data, dict):
        data = {}

    raw_contact = data.get('contact')
    contact = raw_contact if isinstance(raw_contact, dict) else {}

    skills = data.get('skills') or data.get('technologies') or []
    projects = data.get('projects') or []
    education = data.get('education') or []
    experience = data.get('work_experience') or []

    if not isinstance(skills, list):
        skills = []
    if not isinstance(projects, list):
        projects = []
    if not isinstance(education, list):
        education = []
    if not isinstance(experience, list):
        experience = []

    raw_personal_info = data.get('personal_info')
    personal_info = raw_personal_info if isinstance(raw_personal_info, dict) else {
        'full_name': data.get('name') or username,
        'title': (data.get('about') or '').split('\n')[0][:120],
        'email': contact.get('email', ''),
        'phone': contact.get('phone', ''),
        'location': contact.get('location', ''),
    }

    norm_projects = []
    for p in projects:
        if isinstance(p, dict):
            norm_projects.append(
                {
                    'name': p.get('name') or p.get('title') or 'Project',
                    'description': p.get('description') or '',
                }
            )
        else:
            norm_projects.append({'name': str(p), 'description': str(p)})

    norm_education = []
    for e in education:
        if isinstance(e, dict):
            norm_education.append(
                {
                    'school': e.get('school') or e.get('institution') or '',
                    'degree': e.get('degree') or '',
                    'year': e.get('year') or '',
                }
            )
        else:
            norm_education.append({'school': str(e), 'degree': '', 'year': ''})

    norm_experience = []
    for exp in experience:
        if isinstance(exp, dict):
            norm_experience.append(
                {
                    'company': exp.get('company') or '',
                    'position': exp.get('position') or exp.get('role') or '',
                    'duration': exp.get('duration') or '',
                    'description': exp.get('description') or '',
                }
            )
        else:
            norm_experience.append(
                {'company': '', 'position': str(exp), 'duration': '', 'description': str(exp)}
            )

    return {
        'personal_info': personal_info,
        'skills': skills,
        'projects': norm_projects,
        'education': norm_education,
        'experience': norm_experience,
    }


def landing_page(request):
    return render(request, 'web/landing.html')


def login_page(request):
    return render(request, 'web/login.html')


def register_page(request):
    return render(request, 'web/register.html')


def dashboard_page(request):
    return render(request, 'web/dashboard.html')


def upload_resume_page(request):
    return render(request, 'web/upload_resume.html')


def editor_page(request, portfolio_id):
    return render(request, 'web/editor.html', {'portfolio_id': portfolio_id})


def public_portfolio_page(request, username):
    user = get_object_or_404(User, username=username)
    portfolio = (
        Portfolio.objects.filter(user=user, is_published=True)
        .order_by('-updated_at')
        .first()
    )
    if not portfolio:
        return render(
            request,
            'web/public_portfolio.html',
            {'not_found': True, 'username': username},
            status=404,
        )

    safe_data = portfolio.portfolio_data_json if isinstance(portfolio.portfolio_data_json, dict) else {}

    return render(
        request,
        'web/public_portfolio.html',
        {
            'not_found': False,
            'username': username,
            'template_id': portfolio.template_id,
            'data': safe_data,
            'template_data': _normalize_template_data(safe_data, username),
        },
    )
