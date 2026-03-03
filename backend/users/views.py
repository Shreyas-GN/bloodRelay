from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import UserSettings
from .serializers import RegisterSerializer, UserSerializer, UserSettingsSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        """Support POST for initial profile creation during onboarding."""
        serializer = self.get_serializer(self.request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def toggle_availability(request):
    user = request.user

    if "is_available" in request.data:
        new_status = request.data["is_available"]
        if not isinstance(new_status, bool):
            return Response(
                {"error": "is_available must be a boolean"},
                status=status.HTTP_400_BAD_REQUEST,
            )
    else:
        new_status = not user.is_available_donor

    user.is_available_donor = new_status
    user.save(update_fields=["is_available_donor"])

    return Response({"is_available_donor": new_status})


class UserSettingsView(generics.RetrieveUpdateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSettingsSerializer

    def get_object(self):
        settings_obj, _ = UserSettings.objects.get_or_create(user=self.request.user)
        return settings_obj
