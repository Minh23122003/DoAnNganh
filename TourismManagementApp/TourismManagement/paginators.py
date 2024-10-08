from rest_framework import pagination


class TourPaginator(pagination.PageNumberPagination):
    page_size = 2


class CommentPaginator(pagination.PageNumberPagination):
    page_size = 3