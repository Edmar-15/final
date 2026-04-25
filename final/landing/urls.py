from django.urls import path
from . import views
from account.views import home

urlpatterns = [
    path('home', home, name='home'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
]
