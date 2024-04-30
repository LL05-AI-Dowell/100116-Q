from django.urls import path
from ._views import *

urlpatterns = [
    path('',health_check.as_view()),
    path('kitchen-sink/',kitchen_sink_services.as_view()),
    path('user-services/',user_details_services.as_view()),
    path('store-services/',store_services.as_view()),
    path('qrcode-services/',qrcode_services.as_view()),
    path('offline-store-customer-services/',customer_services_offline_store.as_view()),
    path('online-store-customer-services/',customer_services_online_store.as_view()),
]