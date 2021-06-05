from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from datetime import datetime
from django.contrib.auth.decorators import login_required
from django.core.exceptions import ObjectDoesNotExist

from .models import User, Auc_list, Bid, Watchlist, Comment


def index(request):
    return render(request, "auctions/index.html", {
        "auctions": Auc_list.objects.filter(is_active=True)
    })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })        

        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


@login_required(login_url='/login')
def create(request):
    if request.method == "POST":
        user_id = request.user.id
        title = request.POST["title"]
        description = request.POST["description"]
        file = request.FILES.get("file", None)
        category = request.POST["category"]
        start_bid = request.POST["start_bid"]
        dt_hr = datetime.now()

        if not title or not start_bid or category == "Categories":
            invalid = True
            return render(request, "auctions/create.html", {
                "invalid": invalid
            })      
        
        create = Auc_list(user_id=user_id, title=title, description=description, img=file, start_bid=start_bid, category=category, dt_hr=dt_hr)
        create.save()

        return HttpResponseRedirect(reverse("index"))

    else:
        return render(request, "auctions/create.html")

    
def listing(request, id):
    comments = Comment.objects.filter(item=id).order_by('dt_hr')
    listing = Auc_list.objects.get(id=id)
    quantity = Bid.objects.filter(id=id).count()
    in_watch = Watchlist.objects.filter(item=id, user=request.user.id)
    if listing.is_active:
        active = True
        winner = False
    else:
        active = False
        winner = Bid.objects.filter(item=id).order_by('-bid').first() 

    if request.method == "POST":
        if request.user.is_authenticated:
            user_id = request.user.id
            dt_hr = datetime.now()

            if request.POST.get("bid_btn"):
                # Add bid if it meets the requirements

                newbid = int(request.POST["newbid"])
                start_bid = Auc_list.objects.get(id=id)
                other_bids = Bid.objects.filter(item=id).order_by('-bid').first()

                if not other_bids:
                    if newbid >= start_bid.start_bid:
                        success_bid = True
                        bid = Bid(user_id=user_id, item_id=id, bid=newbid, dt_hr=dt_hr)
                        bid.save()
                    else:
                        success_bid = False
                else:
                    if newbid > other_bids.bid:
                        success_bid = True
                        bid = Bid(user_id=user_id, item_id=id, bid=newbid, dt_hr=dt_hr)
                        bid.save()
                    else:
                        success_bid = False
                
                return render(request, "auctions/listing.html", {
                    "item": listing,
                    "bidnum": quantity,
                    "success_bid": success_bid,
                    "active": active,
                    "comments": comments,
                    "in_watch": in_watch
                })
            
            elif request.POST.get("close_btn"):
                # Close auction if user is the creator of it

                if request.user.id == listing.user.id:
                    listing.is_active = False
                    listing.save()
                
                return HttpResponseRedirect(reverse("listing", args=(id,)))
            
            elif request.POST.get("cmnt_btn"):
                # Save comments from listing if user is loged in

                cmnt = request.POST["comment"]
                newcmnt = Comment(user_id=user_id, item_id=id, comment=cmnt, dt_hr=dt_hr)
                newcmnt.save()

                return HttpResponseRedirect(reverse("listing", args=(id,)))

        else:
            return HttpResponseRedirect(reverse("login"))

    else:  
        return render(request, "auctions/listing.html", {
            "item": listing,
            "bidnum": quantity,
            "active": active,
            "winner": winner,
            "comments": comments,
            "in_watch": in_watch
        })


@login_required(login_url='/login')
def watchlist(request):
    if request.method == "POST":
        item_id = request.POST["item_id"]
        user_id = request.user.id

        if request.POST.get("remove_btn_watch"):
            watch = Watchlist.objects.get(user_id=user_id, item_id=item_id)
            watch.delete()

            return HttpResponseRedirect(reverse("watchlist"))        
        
        elif request.POST.get("add_btn"):
            # Add to watchist if the user is loged in
            dt_hr = datetime.now()            
            watch = Watchlist(user_id=user_id, item_id=item_id, dt_hr=dt_hr)
            watch.save()

        elif request.POST.get("remove_btn"):
            # Remove from watchlist
            watch = Watchlist.objects.get(user_id=user_id, item_id=item_id)
            watch.delete()
                
        return HttpResponseRedirect(reverse("listing", args=(item_id)))

    else:
        listings = Watchlist.objects.filter(user=request.user.id)
        return render(request, "auctions/watchlist.html", {
            "items": listings
        })


def categories(request):
    categories = ['fashion', 'toys', 'electronics', 'home', 'vehicles']
    return render(request, "auctions/categories.html", {
        "categories": categories
    })


def category(request, category):
    items = Auc_list.objects.filter(category=category, is_active=True)
    return render(request, "auctions/index.html", {
        "category": category.capitalize(),
        "auctions": items
    })