from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("counter", views.counter, name="counter"),
    path("methods/<str:method>", views.methods, name="methods"),
    path("mylist", views.mylist, name="mylist"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # API's
    path("list/<str:method>", views.make_list, name="list")
    
]