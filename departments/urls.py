from django.urls import path
from . import views

urlpatterns = [
    path('channel/<int:channel_id>/', views.chat_view, name='chat'),
]
