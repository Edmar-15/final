from django.shortcuts import redirect

def get_profile(user):
    return getattr(user, 'userprofile', None)


def anonymous_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            return redirect('home')
        return view_func(request, *args, **kwargs)
    return wrapper


def verification_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            profile = get_profile(request.user)

            if not profile or not profile.is_verified:
                return redirect('verify_email')

        return view_func(request, *args, **kwargs)
    return wrapper


def completion_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.is_authenticated:
            profile = get_profile(request.user)

            if profile and profile.is_verified and not profile.account_complete:
                return redirect('account_completion')

        return view_func(request, *args, **kwargs)
    return wrapper