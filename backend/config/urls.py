from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView


def home(request):
    return JsonResponse({
        'message': 'Finance Dashboard API is running.',
        'docs': '/api/docs/',
        'admin': '/admin/',
    })


urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('records.urls')),      # add this
    path('api/', include('analytics.urls')),    # add this (next step)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]