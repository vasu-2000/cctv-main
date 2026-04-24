from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)

        email = data.get("email")
        password = data.get("password")

        # TEMP: allow any login
        if email and password:
            return JsonResponse({
                "token": "abc123",
                "message": "Login successful"
            })

        return JsonResponse({"error": "Invalid credentials"})

    return JsonResponse({"message": "Only POST allowed"})