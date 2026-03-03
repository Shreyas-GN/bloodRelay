from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to PulseAid API",
        "status": "running",
        "version": "1.0.0",
        "endpoints": {
            "admin": "/admin/",
            "users": "/api/users/",
            "requests": "/api/requests/",
            "notifications": "/api/notifications/"
        }
    })

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/requests/', include('blood_requests.urls')),
    path('api/notifications/', include('notifications.urls')),
]


