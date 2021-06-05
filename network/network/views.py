import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.http import JsonResponse
from django.http import Http404
from django.core.paginator import Paginator, EmptyPage

from .models import User, Post


def index(request):

    return render(request, "network/index.html")


def view_posts(request, page, counter):

    actual_user = request.user.id

    if page == "all":
        pts = Post.objects.all().order_by('-dt_hr')

    elif page == "followed" and actual_user is not None:
        act_user_obj = User.objects.get(id=actual_user)
        following = act_user_obj.follows.all()
        following_ids = []
        for follow in following:
            following_ids.append(follow.id)
        pts = Post.objects.filter(user__in=following_ids).order_by('-dt_hr')
    
    page_number = counter
    p = Paginator(pts, 10)
    total_pages = p.num_pages
    try:
        posts = p.page(page_number).object_list
    except EmptyPage:
        raise Http404("Page does not exist")

    return JsonResponse({"posts": [post.serialize(actual_user) for post in posts], "pagination": {"page": page_number, "total_pages": total_pages, "from": page}}, safe=False)


@login_required(login_url='/login')
def create_post(request):

    # Create new post via POST
    post_cont = request.POST['post-submit']
    
    user = request.user
    post = Post(
            user=user,
            post_content=post_cont
        )
    post.save()
    
    return HttpResponseRedirect(reverse("index"))


@login_required(login_url='/login')
def post_info(request, post_id):

    post = Post.objects.get(id=post_id)
    actual_user = request.user.id
    data = json.loads(request.body)

    if data.get("likes") is not None:

        # Bloking like function for not loged users (server-side)
        if actual_user == None:
            return JsonResponse({"message": "Invalid like."}, status=400)

        # Like/Dislike a post
        
        like = data.get("likes", "")
        user = User.objects.get(id=actual_user)

        if like is True:
            post.likes.add(user)
        else:
            post.likes.remove(user)
        post.save()

        likes = post.likes.all().count()
        
        return JsonResponse(likes, safe=False)

    if data.get("post_content") is not None:

        # Checking that post-user and editor-user are the same (server-side)
        if post.user.id != actual_user:
            return JsonResponse({"message": "Invalid request."}, status=400)
                
        # Update post's content
        post.post_content = data["post_content"]
        post.save()

        return JsonResponse(post.serialize(actual_user), status=201)


def profile(request, user_id):

        try:
            user = User.objects.get(id=user_id)
        except user.DoesNotExist:
            raise Http404("User does not exist")

        followers = User.objects.filter(follows=user_id)
        actual_user = request.user.id

        followed = None
        for follower in followers:
            if actual_user == follower.id:
                followed = True
            else:
                followed = False

        return render(request, "network/profile.html", {
            'id': user_id,
            'username': user.username,
            'act_user_id': actual_user,
            'posts': Post.objects.filter(user=user_id).count(),
            'following': user.follows.all().count(),
            'followers': followers.count(),
            'followed': followed
        })


def profile_info(request, user_id, counter):

    actual_user = request.user.id

    if request.method == "GET":

        pts = Post.objects.filter(user=user_id).order_by('-dt_hr')

        page_number = counter
        p = Paginator(pts, 10)
        total_pages = p.num_pages
        try:
            posts = p.page(page_number).object_list
        except EmptyPage:
            raise Http404("Page does not exist")

        return JsonResponse({"posts": [post.serialize(actual_user) for post in posts], "pagination": {"page": page_number, "total_pages": total_pages, "from": "profile"}}, safe=False)

    else:

        follower_user = User.objects.get(id=actual_user)
        followed_user = User.objects.get(id=user_id)

        data = json.loads(request.body)

        # Checking that post-user and follow-user are not the same (server-side)
        if user_id == actual_user:
            return JsonResponse({"message": "Invalid follow."}, status=400)

        # Follow/Unfollow user
        
        follow = data.get("follow", "")

        if follow is True:
            follower_user.follows.add(followed_user)
        else:
            follower_user.follows.remove(followed_user)
        follower_user.save()

        followers = User.objects.filter(follows=user_id).count()
        
        return JsonResponse(followers, safe=False)   


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")