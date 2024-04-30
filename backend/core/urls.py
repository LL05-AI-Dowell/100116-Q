
from django.contrib import admin
from django.urls import path, include
from healthcheck import *

urlpatterns = [
    path('', health_check.as_view()),
    path("admin/", admin.site.urls),
    path('v3/',include('app.urls')),
    path('v2/',include('app._urls'))
]
