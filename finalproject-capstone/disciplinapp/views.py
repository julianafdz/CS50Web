import json
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.urls import reverse
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta
from django.http import JsonResponse

from .models import User, Task


def index(request):

    return render(request, "disciplinapp/index.html")


def methods(request, method):

    if method == 'gtd' or method == 'dit':
        if request.user.id is None:
            return HttpResponseRedirect(reverse("login"))

    return render(request, "disciplinapp/method.html")


@csrf_exempt
@login_required(login_url='/login')
def make_list(request, method):
    user = request.user.id

    if request.method == "POST":
        for i in range(int(len(request.POST)/4)):
            hours = int(request.POST[f"timehr{i}"])
            mins = int(request.POST[f"timemn{i}"])
            if hours < 10:
                fhours = "0" + str(hours)
            else:
                fhours = str(hours)
            if mins < 10:
                fmins = "0" + str(mins)
            else:
                fmins = str(mins)
            total_time = fhours + ":" + fmins          
            task = Task(
                    user_id=user,
                    task=request.POST[f"task{i}"],
                    time=total_time,
                    description=request.POST[f"desc{i}"],
                    method=method
                )
            task.save()
    
        return HttpResponseRedirect(reverse("mylist"))

    if request.method == "PUT":
        task_id = int(method)
        task = Task.objects.get(id=task_id)

        data = json.loads(request.body)
        if data.get("status") is not None:
            task.status = data["status"]
            task.save()
            return JsonResponse({"updated": "task status updated"}, status=201)
        if data.get("delete") is not None:
            task.delete()
            return JsonResponse({"deleted": "task deleted"}, status=201)

    else:
        tasks = Task.objects.filter(user=user, method=method).order_by('-dt_hr')
        today_list = []
        other_list = []
        if method == 'gtd':            
            for task in tasks:
                if task.dt_hr.date() == datetime.now().date():
                    today_list.append(task)
                else:
                    other_list.append(task)
        elif method == 'dit':
            today = datetime.now().date()
            yesterday = today - timedelta(days=1)
            for task in tasks:
                if task.dt_hr.date() == datetime.now().date():
                    other_list.append(task)
                elif task.dt_hr.date() == yesterday:
                    today_list.append(task)

        return JsonResponse({"today": [task.serialize() for task in today_list], "other": [task.serialize() for task in other_list]}, safe=False)


@login_required(login_url='/login')
def mylist(request):
    return render(request, "disciplinapp/mylist.html")


def counter(request):

    return render(request, "disciplinapp/counter.html")


def login_view(request):
    
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "disciplinapp/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "disciplinapp/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "disciplinapp/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "disciplinapp/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "disciplinapp/register.html")