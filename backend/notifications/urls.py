from django.urls import path
from . import views

urlpatterns = [
    path('', views.NotificationListView.as_view(), name='notification-list'),
    path('mark-read/', views.mark_notifications_read, name='mark-notifications-read'),
    path('unread-count/', views.unread_count, name='unread-count'),
]
