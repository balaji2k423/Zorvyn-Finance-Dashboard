import time
import hashlib
from django.core.cache import cache
from django.http import JsonResponse


class IPRateLimitMiddleware:
    """
    Global IP-based rate limiter applied to every request.
    Stricter limits on auth endpoints to prevent brute force.
    """

    # (limit, window_seconds)
    ENDPOINT_LIMITS = {
        '/api/auth/login/':    (5, 60),    # 5 attempts per minute
        '/api/auth/register/': (10, 60),   # 10 per minute
        'default':             (200, 60),  # 200 per minute for everything else
    }

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = self._get_ip(request)
        path = request.path

        limit, window = self.ENDPOINT_LIMITS.get(
            path, self.ENDPOINT_LIMITS['default']
        )

        key = self._make_key(ip, path, window)
        current = cache.get(key, 0)

        if current >= limit:
            window_start = int(time.time() // window) * window
            retry_after = int(window_start + window - time.time())
            return JsonResponse(
                {
                    'error': 'Too many requests from this IP.',
                    'retry_after': retry_after,
                },
                status=429,
                headers={
                    'Retry-After': str(retry_after),
                    'X-RateLimit-Limit': str(limit),
                    'X-RateLimit-Remaining': '0',
                }
            )

        cache.set(key, current + 1, timeout=window)
        response = self.get_response(request)
        response['X-RateLimit-Limit'] = str(limit)
        response['X-RateLimit-Remaining'] = str(limit - current - 1)
        return response

    def _get_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')

    def _make_key(self, ip, path, window):
        window_bucket = int(time.time() // window)
        raw = f"ip_limit:{ip}:{path}:{window_bucket}"
        return hashlib.md5(raw.encode()).hexdigest()