from django.urls import path
from . import views
from account.views import home
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('profile/', views.profile, name='profile'),
    path("channel/<int:channel_id>/", views.chat_page, name="chat"),
    path("chat/<int:channel_id>/send/", views.send_message, name="send_message"),
    path("fetch-messages/<int:channel_id>/", views.fetch_messages, name="fetch_messages"),
    path("create-channel/", views.create_channel, name="create_channel"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
