from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from .models import Task


# ==========================================
# BASE TEST CLASS
# ==========================================
class BaseAPITestCase(TestCase):
    """Shared setup: creates two users + their tokens."""

    def setUp(self):
        # Create two users
        self.user1 = User.objects.create_user(
            username="alice",
            email="alice@test.com",
            password="password123"
        )
        self.user2 = User.objects.create_user(
            username="bob",
            email="bob@test.com",
            password="password123"
        )

        # Create tokens
        self.token1 = Token.objects.create(user=self.user1)
        self.token2 = Token.objects.create(user=self.user2)

        # API client
        self.client = APIClient()


# ==========================================
# 1. REGISTER TESTS
# ==========================================
class RegisterTests(TestCase):

    def setUp(self):
        self.client = APIClient()

    def test_register_success(self):
        """Successful registration → 201."""
        response = self.client.post("/api/register/", {
            "username": "newuser",
            "email": "new@test.com",
            "password": "strongpass123"
        }, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username="newuser").exists())

    def test_register_weak_password(self):
        """Weak password → 400."""
        response = self.client.post("/api/register/", {
            "username": "newuser",
            "password": "123"
        }, format="json")

        self.assertEqual(response.status_code, 400)

    def test_register_short_username(self):
        """Short username → 400."""
        response = self.client.post("/api/register/", {
            "username": "ab",
            "password": "strongpass123"
        }, format="json")

        self.assertEqual(response.status_code, 400)

    def test_register_duplicate_username(self):
        """Duplicate username → 400."""
        User.objects.create_user(
            username="existing",
            password="password123"
        )

        response = self.client.post("/api/register/", {
            "username": "existing",
            "password": "newpassword123"
        }, format="json")

        self.assertEqual(response.status_code, 400)

    def test_register_missing_password(self):
        """Missing password → 400."""
        response = self.client.post("/api/register/", {
            "username": "newuser"
        }, format="json")

        self.assertEqual(response.status_code, 400)


# ==========================================
# 2. LOGIN TESTS
# ==========================================
class LoginTests(BaseAPITestCase):

    def test_login_success(self):
        """Correct password → 200 + token."""
        response = self.client.post("/api/login/", {
            "username": "alice",
            "password": "password123"
        }, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)

    def test_login_wrong_password(self):
        """Wrong password → 401."""
        response = self.client.post("/api/login/", {
            "username": "alice",
            "password": "wrongpass"
        }, format="json")

        self.assertEqual(response.status_code, 401)

    def test_login_nonexistent_user(self):
        """Nonexistent user → 401."""
        response = self.client.post("/api/login/", {
            "username": "ghost",
            "password": "password123"
        }, format="json")

        self.assertEqual(response.status_code, 401)


# ==========================================
# 3. TASK LIST TESTS
# ==========================================
class TaskListTests(BaseAPITestCase):

    def test_list_tasks_requires_auth(self):
        """No token → 401."""
        response = self.client.get("/api/tasks/")
        self.assertEqual(response.status_code, 401)

    def test_list_tasks_empty(self):
        """No tasks → empty list."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

    def test_list_tasks_only_own(self):
        """User sees only their own tasks."""
        Task.objects.create(user=self.user1, title="Alice task 1", priority="low")
        Task.objects.create(user=self.user1, title="Alice task 2", priority="high")
        Task.objects.create(user=self.user2, title="Bob task 1", priority="medium")

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.get("/api/tasks/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)


# ==========================================
# 4. TASK CREATE TESTS
# ==========================================
class TaskCreateTests(BaseAPITestCase):

    def test_create_task_success(self):
        """Valid task → 201."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.post("/api/tasks/", {
            "title": "New task",
            "description": "Test description",
            "priority": "high"
        }, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Task.objects.count(), 1)
        self.assertEqual(Task.objects.first().user, self.user1)

    def test_create_task_empty_title(self):
        """Empty title → 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.post("/api/tasks/", {
            "title": "",
            "priority": "medium"
        }, format="json")

        self.assertEqual(response.status_code, 400)

    def test_create_task_whitespace_title(self):
        """Whitespace-only title → 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.post("/api/tasks/", {
            "title": "   ",
            "priority": "medium"
        }, format="json")

        self.assertEqual(response.status_code, 400)

    def test_create_task_invalid_priority(self):
        """Invalid priority → 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.post("/api/tasks/", {
            "title": "Test",
            "priority": "hacked"
        }, format="json")

        self.assertEqual(response.status_code, 400)

    def test_create_task_long_title(self):
        """Title over 200 chars → 400."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.post("/api/tasks/", {
            "title": "a" * 201,
            "priority": "medium"
        }, format="json")

        self.assertEqual(response.status_code, 400)


# ==========================================
# 5. TASK DETAIL TESTS
# ==========================================
class TaskDetailTests(BaseAPITestCase):

    def setUp(self):
        super().setUp()
        self.task1 = Task.objects.create(
            user=self.user1,
            title="Alice task",
            priority="medium"
        )

    def test_get_task_success(self):
        """User can view their own task."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.get(f"/api/tasks/{self.task1.id}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["title"], "Alice task")

    def test_get_other_users_task(self):
        """User cannot view another user's task → 404."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token2.key}")
        response = self.client.get(f"/api/tasks/{self.task1.id}/")

        self.assertEqual(response.status_code, 404)

    def test_update_task_success(self):
        """User can update their own task."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.patch(f"/api/tasks/{self.task1.id}/", {
            "title": "Updated title"
        }, format="json")

        self.assertEqual(response.status_code, 200)
        self.task1.refresh_from_db()
        self.assertEqual(self.task1.title, "Updated title")

    def test_update_other_users_task(self):
        """User cannot update another user's task → 404."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token2.key}")
        response = self.client.patch(f"/api/tasks/{self.task1.id}/", {
            "title": "Hacked"
        }, format="json")

        self.assertEqual(response.status_code, 404)

    def test_delete_task_success(self):
        """User can delete their own task → 204."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token1.key}")
        response = self.client.delete(f"/api/tasks/{self.task1.id}/")

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Task.objects.count(), 0)

    def test_delete_other_users_task(self):
        """User cannot delete another user's task → 404."""
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token2.key}")
        response = self.client.delete(f"/api/tasks/{self.task1.id}/")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(Task.objects.count(), 1)
