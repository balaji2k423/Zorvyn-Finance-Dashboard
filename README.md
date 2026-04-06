# Finance Dashboard Backend

Django REST API backend for a role-based finance dashboard system.

## Tech Stack
- Django 4.x + Django REST Framework
- SQLite (development) — swappable to PostgreSQL
- Redis — rate limiting via django-redis
- JWT Authentication — djangorestframework-simplejwt
- API Docs — drf-spectacular (Swagger UI)

## Setup
```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## API Docs
visit https://zorvyn.duckdns.org/api/docs/
Visit http://127.0.0.1:8000/api/docs/

## Roles
| Role    | Records     | Analytics | Users    |
|---------|-------------|-----------|----------|
| Viewer  | Read only   | Dashboard | No       |
| Analyst | Read only   | Full      | No       |
| Admin   | Full CRUD   | Full      | Full     |

## Rate Limiting
- Login: 5 requests/min per IP
- Register: 10 requests/min per IP
- General: 200 requests/min per IP
- Implemented via Redis + custom middleware

## Optional Features Implemented
- JWT auth with refresh + blacklist on logout
- Soft delete with restore endpoint
- Pagination + search + filtering
- Redis rate limiting (IP + user level)
- Swagger API documentation
- Custom error handler

## Assumptions
- SQLite used for simplicity — production would use PostgreSQL
- Redis required for rate limiting — falls back gracefully if unavailable
- Amounts stored as Decimal for financial precision
