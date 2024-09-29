from rest_framework import viewsets, generics, permissions, status, parsers
from TourismManagement import serializers, paginators
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import *
from datetime import datetime
from django.http import JsonResponse
from django.db.models import Sum, Count
import json
import uuid
import requests
import hmac
import hashlib


class TourViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):

    queryset = Tour.objects.filter().order_by('-id')
    serializer_class = serializers.TourDetailsSerializer
    pagination_class = paginators.TourPaginator

    def get_permissions(self):
        if self.action in ['post_comment', 'get_rating', 'post_rating', 'post_booking']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]


    def get_serializer_class(self):
        if self.request.user.is_authenticated:
            return serializers.TourRating
        return self.serializer_class

    def get_queryset(self):
        queries = self.queryset
        if self.action.__eq__('list'):
            price_min = self.request.query_params.get('price_min')
            if price_min:
                tour = Price.objects.values('tour_id').filter(price__gte=int(price_min)).distinct()
                queries = queries.filter(id__in=tour).order_by('-id')
            price_max = self.request.query_params.get('price_max')
            if price_max:
                tour = Price.objects.values('tour_id').filter(price__lte=int(price_max)).distinct()
                queries = queries.filter(id__in=tour).order_by('-id')
            start_date = self.request.query_params.get('start_date')
            try:
                if start_date:
                    queries = queries.filter(start_date=datetime.strptime(start_date, '%Y-%m-%d')).order_by('-id')
            except:
                queries = queries
            location = self.request.query_params.get('location')
            if location:
                l = Location.objects.filter(name__icontains=location)
                destination = Destination.objects.filter(location__in=l).distinct()
                queries = queries.filter(destination__in=destination).distinct().order_by('-id')
            cate_id = self.request.query_params.get('cate_id')
            if cate_id:
                queries = queries.filter(tour_category_id=cate_id).order_by('-id')
        return queries

    @action(methods=['post'], url_path='post-comment', detail=True)
    def post_comment(self, request, pk):
        c = self.get_object().comment_set.create(content=request.data.get('content'), user=request.user)

        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)


    @action(methods=['get'], url_path='get-comment', detail=True)
    def get_comment(self, request, pk):
        comments = self.get_object().comment_set.select_related('user').order_by('-id')

        paginator = paginators.CommentPaginator()
        page = paginator.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        return Response(serializers.CommentSerializer(comments, many=True).data)


    @action(methods=['post'], url_path='post-rating', detail=True)
    def post_rating(self, request, pk):
        rating, created = Rating.objects.update_or_create(tour=self.get_object(), user=request.user,
                                                          defaults={'stars': request.data.get('stars')},
                                                          create_defaults={'stars': request.data.get('stars')})

        return Response(serializers.RatingSerializer(rating).data)


    @action(methods=['get'], url_path='get-rating', detail=True)
    def get_rating(self, request, pk):
        try:
            rating = Rating.objects.get(tour=self.get_object(), user=request.user)
            return Response(serializers.RatingSerializer(rating).data)
        except:
            return JsonResponse({'stars': 0})



    @action(methods=['post'], url_path='post-booking', detail=True)
    def post_booking(self, request, pk):

        booking, created = Booking.objects.get_or_create(user=request.user, price_id=request.data.get('price_id'), pay=False, defaults={'quantity': request.data.get('quantity')})

        if not created:
            return JsonResponse({'content': 'Bạn đã đặt vé cho tour này rồi. Vui lòng hủy vé để đặt lại!', 'status': 406})
        return Response(serializers.BookingSerializer(booking).data, status=status.HTTP_200_OK)


class TourCategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    queryset = TourCategory.objects.filter()
    serializer_class = serializers.TourCategorySerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView, generics.ListAPIView, generics.UpdateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, ]

    def get_permissions(self):
        if self.action in ['get_current_user', 'get_booking']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    @action(methods=['get', 'put'], url_path='current-user', detail=False)
    def get_current_user(self, request):
        user = request.user
        if request.method.__eq__('PUT'):
            for k, v in request.data.items():
                if k == 'avatar' and v == 'undefined':
                    setattr(user, k, User.objects.get(username=user).avatar)
                    continue
                setattr(user, k, v)
            user.save()
        User.objects.filter(username=user).update(last_login=datetime.now())

        return Response(serializers.UserSerializer(user).data)

    @action(methods=['get'], url_path='get-booking', detail=False)
    def get_booking(self, request):
        booking = Booking.objects.filter(user=request.user).order_by("-id")

        return Response(serializers.BookingSerializer(booking, many=True).data)


class BookingViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = Booking.objects.all()

    @action(methods=['post'], url_path='pay-all', detail=False)
    def pay_all(self, request):
        booking = Booking.objects.filter(user_id=request.data.get('user_id'), pay=False)
        for b in booking:
            b.pay = True
            b.save()
            price = Price.objects.get(id=b.price_id)
            bill = Bill.objects.create(booking_id=b.id, total=b.quantity * price.price, method_pay=request.data.get("method_pay"))

        return Response(status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='pay', detail=False)
    def pay(self, request):
        booking = Booking.objects.get(id=request.data.get("id"))
        booking.pay = True
        booking.save()
        bill = Bill.objects.get_or_create(booking_id=booking.id, defaults={'total':request.data.get('total'), 'method_pay':request.data.get("method_pay")})

        return Response(status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='add-rating', detail=True)
    def addRating(self, request, pk):
        rating = Rating.objects.create(booking=self.get_object(), stars=request.data.get('stars'), content=request.data.get('content'))

        return Response(status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='get-link-momo', detail=False)
    def test(self, request):
        # parameters send to MoMo get get payUrl
        endpoint = "https://test-payment.momo.vn/v2/gateway/api/create"
        accessKey = "F8BBA842ECF85"
        secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
        orderInfo = "pay with MoMo"
        partnerCode = "MOMO"
        redirectUrl = "http://localhost:3000/cart"
        ipnUrl = "http://localhost:3000/cart"
        amount = str(request.data.get('amount'))
        orderId = str(uuid.uuid4())
        requestId = str(uuid.uuid4())
        extraData = ""  # pass empty value or Encode base64 JsonString
        partnerName = "MoMo Payment"
        requestType = "payWithMethod"
        storeId = "Test Store"
        orderGroupId = ""
        autoCapture = True
        lang = "vi"
        orderGroupId = ""

        # before sign HMAC SHA256 with format: accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl
        # &orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId
        # &requestType=$requestType
        rawSignature = "accessKey=" + accessKey + "&amount=" + amount + "&extraData=" + extraData + "&ipnUrl=" + ipnUrl + "&orderId=" + orderId \
                       + "&orderInfo=" + orderInfo + "&partnerCode=" + partnerCode + "&redirectUrl=" + redirectUrl \
                       + "&requestId=" + requestId + "&requestType=" + requestType

        # puts raw signature
        print("--------------------RAW SIGNATURE----------------")
        print(rawSignature)
        # signature
        h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
        signature = h.hexdigest()
        print("--------------------SIGNATURE----------------")
        print(signature)

        # json object send to MoMo endpoint

        data = {
            'partnerCode': partnerCode,
            'orderId': orderId,
            'partnerName': partnerName,
            'storeId': storeId,
            'ipnUrl': ipnUrl,
            'amount': amount,
            'lang': lang,
            'requestType': requestType,
            'redirectUrl': redirectUrl,
            'autoCapture': autoCapture,
            'orderInfo': orderInfo,
            'requestId': requestId,
            'extraData': extraData,
            'signature': signature,
            'orderGroupId': orderGroupId
        }

        print("--------------------JSON REQUEST----------------\n")
        data = json.dumps(data)
        print(data)

        clen = len(data)
        response = requests.post(endpoint, data=data,
                                 headers={'Content-Type': 'application/json', 'Content-Length': str(clen)})
        return Response(response.json())

    @action(methods=['post'], url_path='check-status', detail=False)
    def check_status(self, request):
        endpoint = "https://test-payment.momo.vn/v2/gateway/api/query"
        partnerCode = "MOMO"
        orderId = request.data.get('orderId')
        requestId = str(uuid.uuid4())
        lang = "vi"
        accessKey = "F8BBA842ECF85"
        secretKey = "K951B6PE1waDMi640xX08PD3vg6EkVlz"
        rawSignature = "accessKey=" + accessKey + "&orderId=" + orderId \
                       + "&partnerCode=" + partnerCode + "&requestId=" + requestId
        h = hmac.new(bytes(secretKey, 'ascii'), bytes(rawSignature, 'ascii'), hashlib.sha256)
        signature = h.hexdigest()

        data = {
            'partnerCode': partnerCode,
            'orderId': orderId,
            'lang': lang,
            'signature': signature,
            'requestId': requestId
        }
        data = json.dumps(data)
        clen = len(data)
        response = requests.post(endpoint, data=data,
                                 headers={'Content-Type': 'application/json', 'Content-Length': str(clen)})
        return Response(response.json())

class CommentViewSet(viewsets.ViewSet, generics.DestroyAPIView):
    queryset = Comment.objects.all()

    @action(methods=['put'], url_path='patch-comment-tour', detail=False)
    def patch_comment_tour(self, request):
        Comment.objects.filter(id=request.data.get('id')).update(content=request.data.get('content'))

        return Response(status=status.HTTP_200_OK)


class BillViewSet(viewsets.ViewSet):

    @action(methods=['get'], url_path='stats-by-user', detail=False)
    def stats_by_user(self, request):
        bills = Bill.objects.values('booking__user__username').annotate(total=Sum('total'), count=Count('id')).order_by('-total')

        return Response(bills)


    @action(methods=['post'], url_path='stats-by-month', detail=False)
    def stats_by_month(self, request):
        a = str(request.data.get('month')).split('-')
        month = int(a[1])
        year = int(a[0])
        day = 0
        data = {}

        if month == 2:
            if (year % 400 == 0) and (year % 100 == 0):
                day = 29
            elif (year % 4 == 0) and (year % 100 != 0):
                day = 29
            else:
                day = 28
        elif month == 4 or month == 6 or month == 9 or month == 11:
            day = 30
        else:
            day = 31
        data[0] = {'length': day, 'month': month, 'year': year}

        for i in range(day):
            start = datetime(year, month, i + 1)
            end = datetime(year, month, i + 1, 23, 59, 59)
            bill = Bill.objects.filter(created_date__gte=start, created_date__lt=end).aggregate(Sum('total'))
            if bill['total__sum'] is None:
                data[i + 1] = {'day': i + 1, 'total': 0}
            else:
                data[i + 1] = {'day': i + 1, 'total': bill['total__sum']}

        return JsonResponse(data)

    @action(methods=['post'], url_path='stats-by-year', detail=False)
    def stats_by_year(self, request):
        year = int(request.data.get('year'))
        data = {}
        for i in range(12):
            start = datetime(year, i + 1, 1)
            end = None
            if i != 11:
                end = datetime(year, i + 2, 1)
            else:
                end = datetime(year + 1, 1, 1)
            bill = Bill.objects.filter(created_date__gte=start, created_date__lt=end).aggregate(Sum('total'))
            if bill['total__sum'] is None:
                data[i] = {'month': i + 1, 'total': 0}
            else:
                data[i] = {'month': i + 1, 'total': bill['total__sum']}
        return JsonResponse(data)


    @action(methods=['get'], url_path='stats-by-tour', detail=False)
    def stats_by_tour(self, request):
        tours = Tour.objects.all()
        data = {}
        i = 1
        for t in tours:
            prices = Price.objects.filter(tour=t)
            bookings = Booking.objects.filter(price__in=prices)
            if not bookings:
                data[i] = {'name': t.name, 'total': 0, 'count': 0, 'quantity': t.quantity_ticket}
            else:
                bill = Bill.objects.filter(booking__in=bookings).values('booking__price__tour_id').annotate(total=Sum('total'), count=Sum('booking__quantity'))
                print(bill)
                if not bill:
                    data[i] = {'name': t.name, 'total': 0, 'count': 0, 'quantity': t.quantity_ticket}
                else:
                    data[i] = {'name': t.name, 'total': bill[0].get('total'), 'count': bill[0].get('count'), 'quantity': t.quantity_ticket}
            i = i + 1
        data[0] = {'length': i - 1}
        return JsonResponse(data)