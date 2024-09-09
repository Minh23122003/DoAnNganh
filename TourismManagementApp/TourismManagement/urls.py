from django.urls import path, include
from django.contrib import admin
from TourismManagement import views
from rest_framework import routers

r = routers.DefaultRouter()

r.register('tours', views.TourViewSet, basename='tours')
r.register('tours-category', views.TourCategoryViewSet, basename='tours-category')
r.register('user', views.UserViewSet, basename='user')
r.register('booking', views.BookingViewSet, basename='booking')
r.register('comment-tour', views.CommentViewSet, basename='comment-tour')



urlpatterns = [
    path('admin_tools_stats/', include('admin_tools_stats.urls')),
    path('', include(r.urls))
]