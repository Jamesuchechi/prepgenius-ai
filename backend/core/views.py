from django.http import JsonResponse

def health_check(request):
    """
    Simple health check view that returns a JSON response.
    Used to verify the backend is running and to avoid 404 on the root URL.
    """
    return JsonResponse({
        "status": "healthy",
        "message": "PrepGenius AI Backend API is running",
        "version": "1.0.0"
    })
