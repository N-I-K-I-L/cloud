import logging

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render

from apps.portfolios.models import Portfolio

logger = logging.getLogger(__name__)

def _as_text(value, default=''):
    if value is None:
        return default
    if isinstance(value, str):
        return value
    return str(value)


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
    about_text = _as_text(data.get('about'), '')
    name_text = _as_text(data.get('name'), username) or username
    personal_info = raw_personal_info if isinstance(raw_personal_info, dict) else {
        'full_name': name_text,
        'title': about_text.split('\n')[0][:120],
        'email': _as_text(contact.get('email', ''), ''),
        'phone': _as_text(contact.get('phone', ''), ''),
        'location': _as_text(contact.get('location', ''), ''),
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
    safe_template_data = _normalize_template_data(safe_data, username)
    safe_template_id = portfolio.template_id if portfolio.template_id else 'minimal'

    context = {
        'not_found': False,
        'username': username,
        'template_id': safe_template_id,
        'data': safe_data,
        'template_data': safe_template_data,
    }
    try:
        return render(request, 'web/public_portfolio.html', context)
    except Exception as exc:  # pragma: no cover - last-resort production fallback
        logger.exception('Public portfolio render failed for username=%s: %s', username, exc)
        return HttpResponse(
            f"<h1>{_as_text(safe_data.get('name'), username)}</h1><p>Portfolio is temporarily unavailable in full view. Please try again shortly.</p>",
            status=200,
        )
