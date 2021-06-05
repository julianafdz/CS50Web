
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts", views.create_post, name="create_post"),
    path("profile/<int:user_id>", views.profile, name="profile"),

    # API routes
    path("posts/<str:page>/<int:counter>", views.view_posts, name="posts_views"),
    path("post/<int:post_id>", views.post_info, name="post_info"),
    path("info/<int:user_id>/<int:counter>", views.profile_info, name="profile_info")
        
]
