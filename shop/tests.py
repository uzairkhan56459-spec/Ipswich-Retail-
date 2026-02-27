from django.test import TestCase, Client
from django.urls import reverse
from decimal import Decimal
from .models import Category, Product, Order, OrderItem
from .cart.cart import Cart


class CategoryModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )

    def test_category_creation(self):
        self.assertEqual(self.category.name, 'Electronics')
        self.assertEqual(self.category.slug, 'electronics')
        self.assertEqual(str(self.category), 'Electronics')

    def test_category_absolute_url(self):
        url = self.category.get_absolute_url()
        self.assertEqual(url, '/category/electronics/')


class ProductModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            category=self.category,
            name='Laptop',
            slug='laptop',
            price=Decimal('999.99'),
            stock=10,
            available=True
        )

    def test_product_creation(self):
        self.assertEqual(self.product.name, 'Laptop')
        self.assertEqual(self.product.price, Decimal('999.99'))
        self.assertEqual(self.product.stock, 10)
        self.assertTrue(self.product.available)
        self.assertEqual(str(self.product), 'Laptop')

    def test_product_absolute_url(self):
        url = self.product.get_absolute_url()
        self.assertIn('/product/', url) if '/product/' in url else self.assertIn(str(self.product.id), url)


class OrderModelTest(TestCase):
    def setUp(self):
        self.order = Order.objects.create(
            first_name='John',
            last_name='Doe',
            email='john@example.com',
            address='123 Main St',
            postal_code='12345',
            city='New York',
            total_price=Decimal('999.99'),
        )

    def test_order_creation(self):
        self.assertEqual(self.order.first_name, 'John')
        self.assertEqual(self.order.email, 'john@example.com')
        self.assertEqual(self.order.total_price, Decimal('999.99'))
        self.assertEqual(self.order.status, 'pending')


class CartTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            category=self.category,
            name='Laptop',
            slug='laptop',
            price=Decimal('999.99'),
            stock=10,
            available=True
        )

    def test_add_to_cart(self):
        response = self.client.post(
            reverse('cart:cart_add', args=[self.product.id]),
            {'quantity': 1, 'override': False}
        )
        self.assertEqual(response.status_code, 302)

    def test_cart_detail_view(self):
        response = self.client.get(reverse('cart:cart_detail'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'shop/cart/detail.html')


class ProductListViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            category=self.category,
            name='Laptop',
            slug='laptop',
            price=Decimal('999.99'),
            stock=10,
            available=True
        )

    def test_product_list_view(self):
        response = self.client.get(reverse('shop:product_list'))
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'shop/product/list.html')
        self.assertContains(response, 'Laptop')


class ProductDetailViewTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.category = Category.objects.create(
            name='Electronics',
            slug='electronics'
        )
        self.product = Product.objects.create(
            category=self.category,
            name='Laptop',
            slug='laptop',
            price=Decimal('999.99'),
            stock=10,
            available=True,
            description='A great laptop'
        )

    def test_product_detail_view(self):
        response = self.client.get(
            reverse('shop:product_detail', args=[self.product.id, self.product.slug])
        )
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'shop/product/detail.html')
        self.assertContains(response, 'Laptop')
        self.assertContains(response, '999.99')
