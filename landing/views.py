from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
import os
from django.http import JsonResponse
from django.utils.timezone import localtime
from .models import Server, Channel, Message

# Create your views here.
def welcome(request):
    return render(request,'welcome.html')

def about(request):
    return render(request, 'about.html')

def contact(request):
    return render(request, 'contact.html')

@login_required
@require_POST
def profile(request):
    userProfile = request.user.userprofile
    new_file = request.FILES.get("profile_pic")

    if not new_file:
        return JsonResponse({"success": False, "error": "No file uploaded"})

    old_file = userProfile.profile_pic

    if old_file and old_file.name != "profiles/default.png":
        try:
            if os.path.isfile(old_file.path):
                os.remove(old_file.path)
        except Exception:
            pass

    userProfile.profile_pic = new_file
    userProfile.save()

    return JsonResponse({
        "success": True,
        "image_url": userProfile.profile_pic.url
    })

@login_required
def chat_page(request, channel_id):
    active_channel = Channel.objects.get(id=channel_id)

    messages = Message.objects.filter(
        channel=active_channel
    ).order_by("created_at")

    return render(request, "home.html", {
        "server": Server.objects.all(),
        "channel": Channel.objects.all(),
        "active_channel": active_channel,
        "messages": messages,
        "profile": request.user.userprofile
    })

@login_required
@require_POST
def send_message(request, channel_id):
    active_channel = Channel.objects.get(id=channel_id)

    content = request.POST.get("message", "").strip()

    if not content:
        return JsonResponse({"success": False})

    msg = Message.objects.create(
        user=request.user,
        channel=active_channel,
        content=content
    )

    return JsonResponse({
        "success": True,
        "message": {
            "user": msg.user.username,
            "content": msg.content,
            "time": localtime(msg.created_at).strftime("%H:%M")
        }
    })

@login_required
def fetch_messages(request, channel_id):
    last_id = request.GET.get("last_id", 0)

    try:
        last_id = int(last_id)
    except (ValueError, TypeError):
        last_id = 0  # fallback

    messages = Message.objects.filter(
        channel_id=channel_id,
        id__gt=last_id
    ).order_by("id")

    data = []
    for msg in messages:
        data.append({
            "id": msg.id,
            "user": msg.user.username,
            "content": msg.content,
            "time": localtime(msg.created_at).strftime("%H:%M")
        })

    return JsonResponse({"messages": data})