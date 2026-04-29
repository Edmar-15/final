from django.shortcuts import render, redirect
from django.utils import timezone
from .models import Server, Channel, Message

# Create your views here.
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