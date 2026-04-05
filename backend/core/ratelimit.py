import time
import hashlib
from django.core.cache import cache
from rest_framework.response import Response
from rest_framework import status
from functools import wraps


def get_client_ip(request):
    """Extract real IP even behind proxy."""
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def make_cache_key(identifier, endpoint, window):
    """Create a unique Redis key per IP/user + endpoint + time window."""
    window_start = int(time.time() // window)
    raw = f"ratelimit:{identifier}:{endpoint}:{window_start}"
    return hashlib.md5(raw.encode()).hexdigest()


def check_rate_limit(identifier, endpoint, limit, window):
    """
    Returns (is_allowed, remaining, reset_time)
    limit  = max requests allowed
    window = time window in seconds
    """
    key = make_cache_key(identifier, endpoint, window)
    current = cache.get(key, 0)

    window_start = int(time.time() // window) * window
    reset_time = window_start + window

    if current >= limit:
        return False, 0, reset_time

    # Increment counter, set expiry on first request
    pipe_result = cache.get_or_set(key, 0, timeout=window)
    cache.set(key, current + 1, timeout=window)

    remaining = limit - (current + 1)
    return True, remaining, reset_time


def rate_limit(
    ip_limit=60,        # requests per window per IP
    user_limit=100,     # requests per window per authenticated user
    window=60,          # window in seconds
    scope='default'     # endpoint scope name
):
    """
    Decorator for DRF views.
    - Unauthenticated: limits by IP
    - Authenticated:   limits by user ID (higher limit)
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, request, *args, **kwargs):

            # Determine identifier and limit
            if request.user and request.user.is_authenticated:
                identifier = f"user:{request.user.id}"
                limit = user_limit
            else:
                identifier = f"ip:{get_client_ip(request)}"
                limit = ip_limit

            is_allowed, remaining, reset_time = check_rate_limit(
                identifier, scope, limit, window
            )

            if not is_allowed:
                return Response(
                    {
                        'error': 'Too many requests. Please slow down.',
                        'retry_after': int(reset_time - time.time()),
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                    headers={
                        'X-RateLimit-Limit': str(limit),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': str(int(reset_time)),
                        'Retry-After': str(int(reset_time - time.time())),
                    }
                )

            # Attach rate limit info to response
            response = func(self, request, *args, **kwargs)
            response['X-RateLimit-Limit'] = str(limit)
            response['X-RateLimit-Remaining'] = str(remaining)
            response['X-RateLimit-Reset'] = str(int(reset_time))
            return response

        return wrapper
    return decorator