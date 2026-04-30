from django.urls import path
from . import views
from account.views import home
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('home', home, name='home'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('profile/', views.profile, name='profile'),
    path("channel/<int:channel_id>/", views.chat_page, name="chat"),
    path("chat/<int:channel_id>/send/", views.send_message, name="send_message"),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
