


from django.urls import path
from .views import task_list, task_detail , register, login


urlpatterns = [
    path("tasks/", task_list),
    path("tasks/<int:id>/", task_detail),
    path("register/", register),
    path("login/", login),
]