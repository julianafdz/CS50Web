from django.shortcuts import render
from markdown2 import Markdown
from django.http import HttpResponseRedirect
from django.urls import reverse
from django import forms
from random import choice

from . import util


def index(request):
    if request.method == "POST":
        query = request.POST.get('q')
        entries = util.list_entries()
        list = []

        for entry in entries:
            if query.lower() == entry.lower():
                return HttpResponseRedirect(f"/{entry}")
            elif query.lower() in entry.lower():
                list.append(entry)

        return render(request, "encyclopedia/index.html", {
            "entries": list,
            "result": ": Search Results"
        })

    else:
        return render(request, "encyclopedia/index.html", {
            "entries": util.list_entries()
        })


def entry(request, TITLE):
    entry_conv = util.get_entry(TITLE)
    if entry_conv:
        markdowner = Markdown()
        page =  markdowner.convert(entry_conv)
        entry_title = TITLE
    else:
        page = entry_conv
        entry_title = "Not Found"
        
    return render(request, "encyclopedia/entry.html", {
        "entry_page": page,
        "entry_title": entry_title
    })


def newpage(request):
    if request.method == "POST":
        title = request.POST.get('title')
        content = request.POST.get('content')
        if not title or not content:
            return render(request, "encyclopedia/newpage.html", {
                "invalid": True
            })

        entries = util.list_entries()
        for entry in entries:
            if title.lower() == entry.lower():
                 return render(request, "encyclopedia/newpage.html", {
                     "exists": True
                 })

        util.save_entry(title, content)
        return HttpResponseRedirect(f"/{title}")
        
    else:
        return render(request, "encyclopedia/newpage.html")


def editpage(request, TITLE):
    if request.method == "POST":
        title = TITLE
        content = request.POST.get('content')
        util.save_entry(title, content)
        return HttpResponseRedirect(f"/{title}")

    else:
        entry_conv = util.get_entry(TITLE)
        if not entry_conv:
            entry_title = "Not Found"        
            return render(request, "encyclopedia/entry.html", {
                "entry_cont": entry_conv,
                "entry_title": entry_title
            })

        return render(request, "encyclopedia/editpage.html", {
            "entry_cont": entry_conv,
            "entry_title": TITLE
        })


def random(request):
    entries = util.list_entries()
    entry = choice(entries)
    return HttpResponseRedirect(f"/{entry}")

