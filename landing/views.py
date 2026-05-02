from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
import os
from django.http import JsonResponse
from django.utils.timezone import localtime
from .models import Server, Channel, Message
from account.models import UserProfile

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

    profile = request.user.userprofile
    server = profile.server

    active_channel = Channel.objects.filter(
        id=channel_id,
        server=server
    ).first()

    if not active_channel:
        return redirect("home")

    channels = Channel.objects.filter(server=server).order_by('id')

    messages = Message.objects.filter(
        channel=active_channel
    ).order_by("created_at")
    
    members = UserProfile.objects.filter(server=active_channel.server).select_related('user') if active_channel else UserProfile.objects.none()

    return render(request, "home.html", {
        "server": [server],
        "channel": channels,
        "active_channel": active_channel,
        "messages": messages,
        "profile": profile,
        "members" : members
    })

@login_required
@require_POST
def send_message(request, channel_id):

    server = request.user.userprofile.server

    active_channel = Channel.objects.filter(
        id=channel_id,
        server=server
    ).first()

    if not active_channel:
        return JsonResponse({"success": False, "error": "Unauthorized"}, status=403)

    content = request.POST.get("message", "").strip()
    image = request.FILES.get("image")

    # allow text OR image
    if not content and not image:
        return JsonResponse({"success": False})

    msg = Message.objects.create(
        user=request.user,
        channel=active_channel,
        content=content or ""
    )

    if image:
        msg.image = image
        msg.save()

    return JsonResponse({
        "success": True,
        "message": {
            "id": msg.id,
            "user": msg.user.username,
            "user_id": msg.user.id,
            "content": msg.content,
            "time": localtime(msg.created_at).strftime("%H:%M"),
            "image_url": msg.image.url if msg.image else None
        }
    })

@login_required
def fetch_messages(request, channel_id):

    server = request.user.userprofile.server

    channel = Channel.objects.filter(
        id=channel_id,
        server=server
    ).first()

    if not channel:
        return JsonResponse({"messages": []})

    last_id = request.GET.get("last_id", 0)

    try:
        last_id = int(last_id)
    except:
        last_id = 0

    messages = Message.objects.filter(
        channel=channel,
        id__gt=last_id
    ).order_by("id")

    data = []
    for msg in messages:
        data.append({
            "id": msg.id,
            "user": msg.user.username,
            "user_id": msg.user.id,
            "content": msg.content,
            "time": localtime(msg.created_at).strftime("%H:%M"),
            "image_url": msg.image.url if msg.image else None
        })

    return JsonResponse({"messages": data})

@login_required
@require_POST
def create_channel(request):
    profile = request.user.userprofile
    server = profile.server

    name = request.POST.get("name", "").strip()

    if not name:
        return JsonResponse({"success": False, "error": "Channel name required"})

    # prevent duplicates (same as Meta but cleaner response)
    if Channel.objects.filter(server=server, name__iexact=name).exists():
        return JsonResponse({"success": False, "error": "Channel already exists"})

    channel = Channel.objects.create(
        name=name,
        server=server
    )

    return JsonResponse({
        "success": True,
        "channel": {
            "id": channel.id,
            "name": channel.name
        }
    })