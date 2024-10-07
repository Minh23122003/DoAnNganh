import axios from "axios"
import cookie from "react-cookies"

const BASE_URL = 'http://192.168.1.4:8000/'

export const endpoints = {
    'tours': '/tours/',
    'tour': (tourId) => `/tours/${tourId}/`,
    'category': '/category/',
    'login': '/o/token/',
    'current-user': '/user/current-user/',
    'register': '/user/',
    'comment': (tourId) => `/tours/${tourId}/get-comment/`,
    'addComment': (tourId) => `/tours/${tourId}/post-comment/`,
    'deleteComment': (tourId) => `/comment/${tourId}/`,
    'addBooking': (tourId) => `/tours/${tourId}/post-booking/`,
    'booking': '/user/get-booking/',
    'deleteBooking': (id) => `/booking/${id}/`,
    'pay': '/booking/pay/',
    'payAll': '/booking/pay-all/',
    'addRating': (id) => `/booking/${id}/add-rating/`,
    'getLinkMomo': '/booking/get-link-momo/',
    'check-status': '/booking/check-status/',
    'addLike': (tourId) => `/tours/${tourId}/post-like/`,
    'deleteLike': (tourId) => `/tours/${tourId}/delete-like/`
}

export const authAPIs = () => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${cookie.load("access-token")}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});