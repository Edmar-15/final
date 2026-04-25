from django.shortcuts import redirect

def anonymous_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return wrapper

def completion_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            profile = request.user.userprofile_set.first()
            if not profile or not profile.is_verified:
                return redirect('account_completion')
        return view_func(request, *args, **kwargs)
    return wrapper

def verification_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            profile = request.user.userprofile_set.first()

            if profile and profile.is_verified:
                return redirect('home')

        return view_func(request, *args, **kwargs)

    return wrapper

def profile_completion_required(view_func):
    def wrapper(request, *args, **kwargs):

        if request.user.is_authenticated:
            profile = request.user.userprofile_set.first()

            if profile and not profile.is_verified:
                return redirect('verify_email')
            
            if profile and profile.account_complete:
                return redirect('home')

        return view_func(request, *args, **kwargs)

    return wrapper