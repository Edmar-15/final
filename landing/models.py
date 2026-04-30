from django.db import models
from django.conf import settings

# Create your models here.
class Server(models.Model):
    name = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Channel(models.Model):
    name = models.CharField(max_length=255)
    server = models.ForeignKey(Server, on_delete=models.CASCADE, related_name="channels")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.server.name})"
    
    class Meta:
        unique_together = ('server', 'name')

class Message(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name="messages")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["channel", "created_at"]),
        ]