import cloudinary
from django.contrib import admin
from django.utils.html import mark_safe
from .models import *
from django import forms
from ckeditor_uploader.widgets import CKEditorUploadingWidget
from django.urls import path
from django.template.response import TemplateResponse
from django.db.models import Sum, Count


class MyTourAdminSite(admin.AdminSite):
    site_header = 'Stats Tour'

    def get_urls(self):
        return [path('stats/', self.stats_view)] + super().get_urls()

    def stats_view(self, request):
        bills = Bill.objects.values('booking__user__username').annotate(total=Sum('total'), count=Count('id')).order_by('-total')
        return TemplateResponse(request, 'admin/stats.html', {
            'bills': bills
        })


admin_site = MyTourAdminSite(name='tour')


admin.site.register(User)
admin.site.register(TourCategory)
admin.site.register(Tour)
admin.site.register(TourImage)
admin.site.register(Destination)
admin.site.register(Bill)
admin.site.register(Rating)
admin.site.register(Comment)
admin.site.register(Like)
admin.site.register(Booking)
admin.site.register(Price)
admin.site.register(Location)
admin.site.register(TypeOfTicket)