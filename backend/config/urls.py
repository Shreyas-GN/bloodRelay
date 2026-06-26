from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(_request):
    return JsonResponse({"status": "ok", "service": "BloodRelay API"})


urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
]