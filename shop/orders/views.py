from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from shop.models import Order, OrderItem
from shop.cart.cart import Cart
from .forms import OrderCreateForm


def order_create(request):
    cart = Cart(request)
    if len(cart) == 0:
        return redirect('cart:cart_detail')
    if request.method == 'POST':
        form = OrderCreateForm(request.POST)
        if form.is_valid():
            order = form.save(commit=False)
            order.total_price = cart.get_total_price()
            order.save()
            for item in cart:
                OrderItem.objects.create(
                    order=order,
                    product=item['product'],
                    price=item['price'],
                    quantity=item['quantity'],
                )
            cart.clear()
            messages.success(request, f'Order #{order.id} created successfully!')
            return redirect('orders:order_placed', order_id=order.id)
    else:
        form = OrderCreateForm()
    return render(request, 'shop/pages/cart/checkout.html', {'cart': cart, 'form': form})


def order_placed(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    return render(request, 'shop/orders/placed.html', {'order': order})
