from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('shop.urls', namespace='shop')),
    path('cart/', include('shop.cart.urls', namespace='cart')),
    path('orders/', include('shop.orders.urls', namespace='orders')),
    # Serve media files in both dev and production (DEBUG-independent)
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
