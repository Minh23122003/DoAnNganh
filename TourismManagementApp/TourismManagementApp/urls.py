"""
URL configuration for TourismManagementApp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework_simplejwt.views import (
TokenObtainPairView,
TokenRefreshView
)
from django.conf import settings
from django.urls import include, path
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from TourismManagement.admin import admin_site

schema_view = get_schema_view(
    openapi.Info(
        title="TourismManagementApp",
        default_version='v1',
        description="APIs for TourismManagementApp",
        contact=openapi.Contact(email="minhminhb2vtt@gmail.com"),
        license=openapi.License(name="Đồng Bá Minh"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('', include('TourismManagement.urls')),
    path('stats/', admin_site.urls),
    path('admin/', admin.site.urls),
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls')),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0),
            name='schema-json'),
    re_path(r'^swagger/$',
            schema_view.with_ui('swagger', cache_timeout=0),
    name='schema-swagger-ui'),
    re_path(r'^redoc/$',
        schema_view.with_ui('redoc', cache_timeout=0),
        name='schema-redoc'),
    path('o/', include('oauth2_provider.urls',
                       namespace='oauth2_provider')),
    path('api/token/', TokenObtainPairView.as_view(),
            name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),
            name='token_refresh'),
]
