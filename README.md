# AI-Based Resume-to-Portfolio Generator

Full-stack web app that converts a developer resume PDF into an editable, publishable portfolio website.

## Tech Stack

- Backend: Django, Django REST Framework, Simple JWT
- Frontend: Django templates + HTML/CSS/JavaScript
- Parsing: pdfplumber + regex section extraction
- Dev DB: SQLite
- Deploy DB: SQLite
- Deployment: Render (single web service)

## Project Structure

- `backend/`
  - `apps/users/`
  - `apps/portfolios/`
  - `apps/resume_parser/`
  - `config/`
- `frontend/`
  - optional legacy React files (not required for runtime)
- `backend/apps/web/`
  - `templates/web/`
  - `static/web/`
- `render.yaml`
- `Procfile`

## Features

- Register/Login with JWT authentication
- Dashboard with list of portfolios and publish state
- Resume PDF upload and parsing
- Extracted JSON data for name/about/skills/projects/education/experience/contact
- 3 portfolio templates:
  - Minimal Developer Template
  - Dark Developer Theme
  - Modern Card Layout
- Editor for modifying extracted fields
- Publish portfolio to public URL: `/portfolio/:username`
- Publish API returns shareable public URL after successful publish

## Local Development

### 1) Backend setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at `http://127.0.0.1:8000`.

### 2) Frontend setup

No separate frontend process is required. Django serves all pages directly.

## API Overview

- `POST /api/auth/register/`
- `POST /api/auth/token/`
- `POST /api/auth/token/refresh/`
- `GET /api/auth/me/`
- `GET /api/portfolios/`
- `POST /api/portfolios/upload/` (multipart: `resume`, `template_id`)
- `GET /api/portfolios/<id>/`
- `PATCH /api/portfolios/<id>/`
- `POST /api/portfolios/<id>/publish/`
- `GET /api/portfolios/public/<username>/`

Publish response example:

```json
{
  "detail": "Portfolio published successfully.",
  "public_url": "https://<render-app-name>.onrender.com/portfolio/<username>",
  "username": "<username>"
}
```

## Environment Variables

Backend supports:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`

## Deploying to Render (Single Service)

This repo includes `render.yaml` that:

1. Installs backend requirements
2. Runs migrations and collectstatic
3. Starts Gunicorn

Django serves template pages and static assets in production.
Deployment uses SQLite by default (no `DATABASE_URL` required).

## Production URL Pattern

Public portfolios are available at:

- `https://yourapp.onrender.com/portfolio/<username>`

Example:

- `https://yourapp.onrender.com/portfolio/johndoe`
