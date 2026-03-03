from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import BloodRequest
from .serializers import BloodRequestSerializer, BloodRequestDetailSerializer, BloodBankSerializer
from matching.services import get_donors_with_distance, is_rare_blood_group
from .models import BloodBank

User = get_user_model()

ACTIVE_STATUSES = [BloodRequest.RequestStatus.CREATED, BloodRequest.RequestStatus.SEARCHING]


class BloodRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = BloodRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BloodRequest.objects.exclude(
            status__in=["COMPLETED", "CANCELLED", "EXPIRED"]
        ).order_by("-created_at")

    def perform_create(self, serializer):
        active = BloodRequest.objects.filter(
            requester=self.request.user,
            status__in=ACTIVE_STATUSES,
        ).first()

        if active:
            raise ValidationError({
                "error": "You already have an active blood request",
                "active_request_id": active.id,
            })

        blood_request = serializer.save(requester=self.request.user)

        if is_rare_blood_group(blood_request.blood_group):
            blood_request.is_rare_blood = True

        blood_request.status = BloodRequest.RequestStatus.SEARCHING
        blood_request.save()


class BloodRequestDetailView(generics.RetrieveUpdateAPIView):
    queryset = BloodRequest.objects.all()
    serializer_class = BloodRequestDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        obj = super().get_object()
        if obj.status == BloodRequest.RequestStatus.SEARCHING and not obj.is_assisted:
            elapsed = timezone.now() - obj.created_at
            if elapsed.total_seconds() > 1800:
                obj.is_assisted = True
                obj.save()
        return obj

    def perform_update(self, serializer):
        blood_request = self.get_object()

        if blood_request.requester != self.request.user:
            raise ValidationError({"error": "Only the requester can update this request"})

        if blood_request.status not in ACTIVE_STATUSES:
            raise ValidationError({
                "error": f"Cannot update a request with status: {blood_request.status}"
            })

        serializer.save()


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def find_matching_donors(request, request_id):
    try:
        blood_request = BloodRequest.objects.get(id=request_id)
    except BloodRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    donors = get_donors_with_distance(blood_request, max_distance_km=50)

    fallback_banks = []
    if not donors:
        banks = BloodBank.objects.filter(city__iexact=blood_request.city)
        fallback_banks = BloodBankSerializer(banks, many=True).data

    return Response({
        "request_id": request_id,
        "blood_group": blood_request.blood_group,
        "matching_donors": donors[:10],
        "fallback_blood_banks": fallback_banks,
        "total_found": len(donors),
    })


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def accept_request(request, request_id):
    try:
        blood_request = BloodRequest.objects.get(id=request_id)
    except BloodRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    if blood_request.status not in ACTIVE_STATUSES or blood_request.assigned_donor:
        return Response(
            {"error": "This request is no longer available"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    blood_request.assigned_donor = request.user
    blood_request.status = BloodRequest.RequestStatus.ACCEPTED
    blood_request.save()

    return Response({
        "message": "Request accepted",
        "request": BloodRequestDetailSerializer(blood_request).data,
    })


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def complete_request(request, request_id):
    try:
        blood_request = BloodRequest.objects.get(id=request_id)
    except BloodRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    if blood_request.requester != request.user:
        return Response({"error": "Only the requester can complete this request"}, status=status.HTTP_403_FORBIDDEN)

    blood_request.status = BloodRequest.RequestStatus.COMPLETED
    blood_request.save()

    if blood_request.assigned_donor:
        donor = blood_request.assigned_donor
        donor.is_available_donor = False
        donor.last_donation_date = timezone.now().date()
        donor.save()

    return Response({
        "message": "Request completed",
        "request": BloodRequestDetailSerializer(blood_request).data,
    })


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def cancel_request(request, request_id):
    try:
        blood_request = BloodRequest.objects.get(id=request_id)
    except BloodRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=status.HTTP_404_NOT_FOUND)

    if blood_request.requester != request.user:
        return Response({"error": "Only the requester can cancel this request"}, status=status.HTTP_403_FORBIDDEN)

    if blood_request.status == BloodRequest.RequestStatus.COMPLETED:
        return Response({"error": "Cannot cancel a completed request"}, status=status.HTTP_400_BAD_REQUEST)

    blood_request.status = BloodRequest.RequestStatus.CANCELLED
    blood_request.save()

    return Response({
        "message": "Request cancelled",
        "request": BloodRequestDetailSerializer(blood_request).data,
    })
