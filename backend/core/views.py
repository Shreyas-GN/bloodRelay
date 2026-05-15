from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import DonorProfile, BloodRequest
from .serializers import BloodRequestSerializer
from .services import MatchingEngineClient

class BloodRequestViewSet(viewsets.ModelViewSet):
    queryset = BloodRequest.objects.all()
    serializer_class = BloodRequestSerializer

    def create(self, request, *args, **kwargs):
        # 1. Validate data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 2. Extract latitude/longitude from request (passed from frontend)
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if lat is None or lng is None:
            return Response(
                {"error": "Latitude and longitude are required for matching."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Save the request to Django DB
        blood_request = serializer.save()
        
        # 4. Trigger Matching Engine (FastAPI)
        client = MatchingEngineClient()
        matching_result = client.trigger_matching(blood_request, lat, lng)
        
        return Response({
            "request": serializer.data,
            "matching_triggered": matching_result is not None,
            "matching_engine_response": matching_result
        }, status=status.HTTP_201_CREATED)
