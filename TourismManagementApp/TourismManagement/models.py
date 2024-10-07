from django.db import models
from django.contrib.auth.models import AbstractUser
from ckeditor.fields import RichTextField
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    avatar = CloudinaryField(null=False)
    phone = models.CharField(max_length=10, null=False)

    class Meta:
        db_table = 'user'


class BaseModel(models.Model):
    created_date = models.DateTimeField(auto_now_add=True, null=True)
    updated_date = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        abstract = True


class TourCategory(BaseModel):
    name = models.CharField(max_length=100, unique=True, null=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'tour_category'


class Location(BaseModel):
    name = models.CharField(max_length=100, unique=True, null=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'location'


class Destination(BaseModel):
    name = models.CharField(max_length=200, null=False)
    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'destination'


class Tour(BaseModel):
    name = models.CharField(max_length=150, null=False)
    start_date = models.DateField(null=False)
    end_date = models.DateField(null=False)
    description = RichTextField(null=False)
    quantity_ticket = models.IntegerField(null=False)
    tour_category = models.ForeignKey(TourCategory, on_delete=models.CASCADE)
    destination = models.ManyToManyField(Destination)
    note = models.CharField(max_length=200, default='Không có')

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'tour'


class TourImage(BaseModel):
    name = models.CharField(max_length=150, null=False)
    image = CloudinaryField(null=False)
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'tour_image'


class TypeOfTicket(BaseModel):
    name = models.CharField(max_length=100, null=False)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'type_of_ticket'


class Price(BaseModel):
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    type = models.ForeignKey(TypeOfTicket, on_delete=models.CASCADE)
    price = models.IntegerField(null=False)

    # def __str__(self):
    #     return self.id

    class Meta:
        db_table = 'price'


class Booking(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    price = models.ForeignKey(Price, on_delete=models.CASCADE)
    quantity = models.IntegerField(null=False)
    is_pay = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user_id} - {self.price_id}'

    class Meta:
        db_table = 'booking'


class Bill(BaseModel):
    methodPay = {'zalo_pay': "Zalo pay", 'momo': "Momo"}
    total = models.IntegerField(null=False)
    method_pay = models.CharField(max_length=50, null=False, choices=methodPay)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.booking_id}'

    class Meta:
        db_table = 'bill'


class Rating(BaseModel):
    stars = models.FloatField(null=False)
    content = models.CharField(max_length=255, null=False)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE)

    def __str__(self):
        return self.id

    class Meta:
        db_table = 'rating'


class Comment(BaseModel):
    content = models.CharField(max_length=200, null=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user_id} - {self.tour_id}'

    class Meta:
        db_table = 'comment'


class Like(BaseModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tour = models.ForeignKey(Tour, on_delete=models.CASCADE)
    liked = models.BooleanField(default=True)

    class Meta:
        unique_together = ('user', 'tour')
        db_table = 'like'

    def __str__(self):
        return f'{self.user_id} - {self.tour_id}'