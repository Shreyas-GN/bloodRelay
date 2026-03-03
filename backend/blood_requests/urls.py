from django.urls import path
from .views import (
    BloodRequestListCreateView, 
    BloodRequestDetailView,
    find_matching_donors,
    accept_request,
    complete_request,
    cancel_request
)

urlpatterns = [
    path('', BloodRequestListCreateView.as_view(), name='request-list-create'),
    path('<int:pk>/', BloodRequestDetailView.as_view(), name='request-detail'),
    path('<int:request_id>/donors/', find_matching_donors, name='find-donors'),
    path('<int:request_id>/accept/', accept_request, name='accept-request'),
    path('<int:request_id>/complete/', complete_request, name='complete-request'),
    path('<int:request_id>/cancel/', cancel_request, name='cancel-request'),
]

