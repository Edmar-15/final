from django.urls import path
from . import views
from account.views import home
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('home/', home, name='home'),
    path('profile/', views.profile, name='profile'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
