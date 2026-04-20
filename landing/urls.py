from django.urls import path
from . import views
from account.views import home

urlpatterns = [
    path('/home', home, name='home'),
]
