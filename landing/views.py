from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from account.models import UserProfile
import os
from django.conf import settings

# Create your views here.
def welcome(request):
    return render(request,'welcome.html')

@login_required
def profile(request):
    userProfile = request.user.userprofile

    if request.method == "POST":
        new_file = request.FILES.get("profile_pic")

        if new_file:
            if userProfile.profile_pic:
                old_file = userProfile.profile_pic

                if old_file.name != "profiles/default.jpg":
                    if os.path.isfile(old_file.path):
                        os.remove(old_file.path)

            # save new file
            userProfile.profile_pic = new_file
            userProfile.save()

            return redirect("profile")

    return render(request, 'profile.html', {
        'profile': userProfile,
    })