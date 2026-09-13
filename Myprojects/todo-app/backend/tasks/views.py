from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

from .models import Task
from .serializers import TaskSerializer


# ==========================================
# TASK LIST — GET (list) / POST (create)
# ==========================================
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def task_list(request):

    if request.method == "GET":
        tasks = Task.objects.filter(user=request.user).order_by("-created_at")
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    if request.method == "POST":
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ==========================================
# TASK DETAIL — GET / PATCH / DELETE
# ==========================================
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def task_detail(request, id):

    try:
        task = Task.objects.get(id=id, user=request.user)
    except Task.DoesNotExist:
        return Response(
            {"error": "Task not found."},
            status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    if request.method == "PATCH":
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    if request.method == "DELETE":
        task.delete()
        return Response(
            {"message": "Task deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# ==========================================
# REGISTER
# ==========================================
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    # Required fields
    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Username length
    if len(username) < 3:
        return Response(
            {"error": "Username must be at least 3 characters."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Password length
    if len(password) < 8:
        return Response(
            {"error": "Password must be at least 8 characters."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Email format
    if email and "@" not in email:
        return Response(
            {"error": "Please enter a valid email address."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Username already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Email already exists
    if email and User.objects.filter(email=email).exists():
        return Response(
            {"error": "Email already registered."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user
    User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    return Response(
        {"message": "User created successfully."},
        status=status.HTTP_201_CREATED
    )


# ==========================================
# LOGIN
# ==========================================
@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):

    username = request.data.get("username")
    password = request.data.get("password")

    # Authenticate
    user = authenticate(
        username=username,
        password=password
    )

    if user is None:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Get or create token
    token, created = Token.objects.get_or_create(user=user)

    return Response({
        "message": "Login successful.",
        "username": user.username,
        "token": token.key
    })