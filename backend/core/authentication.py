import jwt
from rest_framework import authentication, exceptions
from django.contrib.auth.models import User
import os

class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Custom Authentication class for Clerk JWTs.
    In a production environment, you should verify the signature using 
    Clerk's JWKS or Public PEM key.
    """
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        # 2. Standard Decode Process
        try:
            # Note: Signature verification is disabled for this simplified setup.
            # In production, use: jwt.decode(token, CLERK_PUBLIC_KEY, algorithms=['RS256'])
            payload = jwt.decode(token, options={"verify_signature": False})
            
            clerk_id = payload.get('sub')
            if not clerk_id:
                raise exceptions.AuthenticationFailed('Invalid Clerk token: No sub found')

            # Get or create a local Django user mapping to the Clerk ID
            user, created = User.objects.get_or_create(username=clerk_id)
            
            # Ensure DonorProfile exists
            from .models import DonorProfile
            DonorProfile.objects.get_or_create(
                id=clerk_id,
                defaults={
                    "full_name": payload.get('name', 'Clerk User'),
                    "phone": payload.get('phone_number', '+919999999999'),
                    "blood_group": payload.get('blood_group', 'O+'),
                    "is_donor": True
                }
            )
            return (user, None)
            
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Authentication failed: {str(e)}')
