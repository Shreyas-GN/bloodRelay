import jwt
import requests
from functools import lru_cache
from django.conf import settings
from rest_framework import authentication, exceptions
from django.contrib.auth import get_user_model
from jwt.algorithms import RSAAlgorithm

User = get_user_model()


@lru_cache(maxsize=1)
def get_clerk_jwks() -> dict:
    jwks_url = f"https://{settings.CLERK_FRONTEND_API}/.well-known/jwks.json"
    try:
        response = requests.get(jwks_url, timeout=5)
        response.raise_for_status()
        return response.json()
    except Exception as exc:
        raise exceptions.AuthenticationFailed(f"Failed to fetch JWKS: {exc}") from exc


class ClerkAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None
        token = parts[1]

        try:
            jwks = get_clerk_jwks()
            header = jwt.get_unverified_header(token)
            kid = header.get("kid")

            if not kid:
                raise exceptions.AuthenticationFailed("Token missing kid header")

            key_data = next(
                (k for k in jwks.get("keys", []) if k.get("kid") == kid), None
            )
            if not key_data:
                raise exceptions.AuthenticationFailed("No matching key found in JWKS")

            public_key = RSAAlgorithm.from_jwk(key_data)
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                leeway=60,
                options={"verify_signature": True, "verify_exp": True},
            )

            clerk_user_id = payload.get("sub")
            if not clerk_user_id:
                raise exceptions.AuthenticationFailed("Token missing sub claim")

            user, created = User.objects.get_or_create(
                username=clerk_user_id,
                defaults={
                    "email": payload.get("email", ""),
                    "first_name": payload.get("given_name", ""),
                    "last_name": payload.get("family_name", ""),
                },
            )

            if not created and payload.get("email") and user.email != payload["email"]:
                user.email = payload["email"]
                user.save(update_fields=["email"])

            return (user, None)

        except jwt.ExpiredSignatureError as exc:
            raise exceptions.AuthenticationFailed("Token has expired") from exc
        except jwt.InvalidTokenError as exc:
            raise exceptions.AuthenticationFailed(f"Invalid token: {exc}") from exc
