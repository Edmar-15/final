from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from account.models import UserProfile

# Create your views here.
def welcome(request):
    return render(request,'welcome.html')

@login_required
def profile(request):
    userProfile = request.user.userprofile
    return render(request, 'profile.html', {
        'profile': userProfile,
    })