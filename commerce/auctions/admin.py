from django.contrib import admin

from .models import User, Auc_list, Bid, Comment, Watchlist
# Register your models here.

admin.site.register(User)
admin.site.register(Auc_list)
admin.site.register(Bid)
admin.site.register(Comment)
admin.site.register(Watchlist)