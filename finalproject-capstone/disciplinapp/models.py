from django.contrib.auth.models import AbstractUser
from django.db import models
from datetime import datetime


class User(AbstractUser):
    pass

class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_tasks")
    task = models.CharField(max_length=25)
    time = models.TimeField()
    description = models.TextField()
    method = models.CharField(max_length=3)
    status = models.TextField(default="Undone")
    dt_hr = models.DateTimeField(default=datetime.now)

    def serialize(self):
        timelist = str(self.time).split(':')
        return {
            "id": self.id,
            "task": self.task,
            "time": self.time,
            "hr": timelist[0],
            "mn": timelist[1],
            "sc": timelist[2],
            "descrip": self.description,
            "method": self.method,
            "status": self.status,
            "dt_hr": self.dt_hr.strftime("%m/%d/%Y - %H:%M:%S")
        }