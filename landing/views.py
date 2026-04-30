from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from account.models import UserProfile
import os
from django.conf import settings
from django.utils import timezone
from .models import Server, Channel, Message

# Create your views here.
def welcome(request):
    return render(request,'welcome.html')

def about(request):
    return render(request, 'about.html')

def contact(request):
    return render(request, 'contact.html')
@login_required
def profile(request):
    userProfile = request.user.userprofile

    if request.method == "POST":
        new_file = request.FILES.get("profile_pic")

        if new_file:
            if userProfile.profile_pic:
                old_file = userProfile.profile_pic

                if old_file.name != "profiles/default.jpg":
                    if os.path.isfile(old_file.path):
                        os.remove(old_file.path)

            # save new file
            userProfile.profile_pic = new_file
            userProfile.save()

            return redirect("profile")

    return render(request, 'profile.html', {
        'profile': userProfile,
    })

@login_required
def chat_view(request, channel_id):
    channels = Channel.objects.all()
    servers = Server.objects.all()

    active_channel = Channel.objects.get(id=channel_id)

    if request.method == "POST":
        content = request.POST.get("message")

        if content and content.strip():  # prevent empty messages
            Message.objects.create(
                content=content,
                created_at=timezone.now(),
                channel=active_channel,
                user=request.user
            )

        return redirect('chat', channel_id=channel_id)

    messages = Message.objects.filter(
        channel=active_channel
    ).order_by('created_at')

    return render(request, 'home.html', {
        'server': servers,
        'channel': channels,
        'active_channel': active_channel,
        'messages': messages
    })