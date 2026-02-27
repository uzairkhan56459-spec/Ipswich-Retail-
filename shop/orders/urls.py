from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('create/', views.order_create, name='order_create'),
    path('placed/<int:order_id>/', views.order_placed, name='order_placed'),
]
