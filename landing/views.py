from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from account.models import UserProfile

# Create your views here.
def welcome(request):
    return render(request,'welcome.html')

@login_required
def profile(request):
    userProfile = request.user.userprofile

    if request.method == "POST":
        if request.FILES.get("profile_pic"):
            userProfile.profile_pic = request.FILES["profile_pic"]
            userProfile.save()
            return redirect("profile") 

    return render(request, 'profile.html', {
        'profile': userProfile,
    })