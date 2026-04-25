from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from .forms import RegisterForm, AccountCompletion
from .models import EmailOTP, UserProfile
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from final import decorators

# Create your views here.
@decorators.anonymous_required
def register_view(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            UserProfile.objects.get_or_create(user=user)
            login(request, user)
            return redirect('verify_email')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

@decorators.anonymous_required
def login_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        user = authenticate(request, email=email, password=password)

        if user is not None:
            login(request, user)

            profile = getattr(request.user, 'userprofile', None)

            if not profile:
                profile = UserProfile.objects.create(user=request.user)

            if not profile.is_verified:
                return redirect('verify_email')

            if not profile.account_complete:
                return redirect('account_completion')

            return redirect('home')
        
    return render(request, 'login.html')
    
def logout_view(request):
    logout(request)
    return redirect('login')

@login_required
@decorators.verification_required
@decorators.completion_required
def home(request):
    return render(request, 'home.html')

from django.contrib.auth.decorators import login_required

@login_required
@decorators.verification_required
def account_completion(request):

    profile = request.user.userprofile

    if request.method == "POST":
        form = AccountCompletion(request.POST, request.FILES, instance=profile)

        if form.is_valid():
            form.save()

            profile.account_complete = True
            profile.save()

            return redirect("home")

    else:
        form = AccountCompletion(instance=profile)

    return render(request, "account_completion.html", {"form": form})

def send_otp(user):
    otp_obj, created = EmailOTP.objects.get_or_create(user=user)
    otp_obj.generate_otp()
    otp_obj.created_at = timezone.now()
    otp_obj.save(update_fields=['otp', 'created_at'])

    send_mail(
        'Your Verification Code',
        f'Your OTP code is {otp_obj.otp}',
        'yourgmail@gmail.com',
        [user.email],
        fail_silently=False
    )

@login_required
def verify_email(request):
    profile = getattr(request.user, 'userprofile', None)

    if profile and profile.is_verified:
        return redirect('home')

    otp_obj = EmailOTP.objects.filter(user=request.user).last()

    # send OTP if none exists
    if not otp_obj:
        send_otp(request.user)

    if request.method == "POST":
        otp = request.POST.get("otp")

        otp_obj = EmailOTP.objects.filter(user=request.user).last()

        if not otp_obj:
            return render(request, "verify_email.html", {"error": "No OTP found."})

        if timezone.now() - otp_obj.created_at > timedelta(minutes=5):
            send_otp(request.user)
            return render(request, "verify_email.html", {"error": "OTP expired. New OTP sent."})

        if otp_obj.otp == otp:
            profile, _ = UserProfile.objects.get_or_create(user=request.user)
            profile.is_verified = True
            profile.save()

            otp_obj.delete()

            return redirect("account_completion")

        return render(request, "verify_email.html", {"error": "Invalid OTP"})

    return render(request, "verify_email.html")