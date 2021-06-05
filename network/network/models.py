from django.contrib.auth.models import AbstractUser
from django.db import models
import django.utils.timezone


class User(AbstractUser):
    pass
    follows = models.ManyToManyField("User", blank=True)   


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="post")
    post_content = models.TextField()
    dt_hr = models.DateTimeField(default=django.utils.timezone.now)
    likes = models.ManyToManyField(User, blank=True, related_name="like")

    def serialize(self, act_user):
        return {
            "id": self.id,
            "user": [self.user.id, self.user.username],
            "post_cont": self.post_content,
            "dt_hr": self.dt_hr.strftime("%m/%d/%Y, %H:%M:%S"),
            "likes": [like.id for like in self.likes.all()],
            "actual_user": act_user
        }