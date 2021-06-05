from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

class Auc_list(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=140)
    description = models.TextField()
    img = models.ImageField(upload_to='static/photos', default=None)
    start_bid = models.DecimalField(max_digits=8, decimal_places=2)
    category = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    dt_hr = models.DateTimeField()
        
    
class Bid(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Auc_list, on_delete=models.CASCADE)
    bid = models.DecimalField(max_digits=8, decimal_places=2)
    dt_hr = models.DateTimeField()

    
class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Auc_list, on_delete=models.CASCADE)
    comment = models.TextField()
    dt_hr = models.DateTimeField()

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Auc_list, on_delete=models.CASCADE)
    dt_hr = models.DateTimeField()



    