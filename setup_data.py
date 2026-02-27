import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce.settings')
django.setup()

from shop.models import Category, Product
from decimal import Decimal

def setup_sample_data():
    electronics, _ = Category.objects.get_or_create(
        name='Electronics',
        slug='electronics'
    )
    
    clothing, _ = Category.objects.get_or_create(
        name='Clothing',
        slug='clothing'
    )
    
    home, _ = Category.objects.get_or_create(
        name='Home & Garden',
        slug='home-garden'
    )
    
    books, _ = Category.objects.get_or_create(
        name='Books',
        slug='books'
    )
    
    products = [
        {
            'category': electronics,
            'name': 'MacBook Pro 16"',
            'slug': 'macbook-pro-16',
            'price': Decimal('2499.99'),
            'stock': 15,
            'description': 'Powerful laptop with M2 Pro chip, 16GB RAM, 512GB SSD.'
        },
        {
            'category': electronics,
            'name': 'iPhone 15 Pro',
            'slug': 'iphone-15-pro',
            'price': Decimal('999.99'),
            'stock': 25,
            'description': 'Latest iPhone with A17 Pro chip and titanium design.'
        },
        {
            'category': electronics,
            'name': 'Sony WH-1000XM5',
            'slug': 'sony-wh-1000xm5',
            'price': Decimal('399.99'),
            'stock': 30,
            'description': 'Industry-leading noise canceling headphones.'
        },
        {
            'category': electronics,
            'name': 'iPad Air',
            'slug': 'ipad-air',
            'price': Decimal('599.99'),
            'stock': 20,
            'description': 'Powerful tablet with M1 chip and Liquid Retina display.'
        },
        {
            'category': clothing,
            'name': 'Classic Denim Jacket',
            'slug': 'classic-denim-jacket',
            'price': Decimal('79.99'),
            'stock': 50,
            'description': 'Timeless denim jacket in classic blue.'
        },
        {
            'category': clothing,
            'name': 'Premium Cotton T-Shirt',
            'slug': 'premium-cotton-tshirt',
            'price': Decimal('29.99'),
            'stock': 100,
            'description': 'Soft, breathable cotton t-shirt.'
        },
        {
            'category': home,
            'name': 'Smart Robot Vacuum',
            'slug': 'smart-robot-vacuum',
            'price': Decimal('449.99'),
            'stock': 12,
            'description': 'Intelligent cleaning robot with mapping technology.'
        },
        {
            'category': home,
            'name': 'Espresso Coffee Machine',
            'slug': 'espresso-coffee-machine',
            'price': Decimal('299.99'),
            'stock': 18,
            'description': 'Professional-grade espresso machine.'
        },
        {
            'category': books,
            'name': 'The DevOps Handbook',
            'slug': 'devops-handbook',
            'price': Decimal('39.99'),
            'stock': 35,
            'description': 'Comprehensive guide to implementing DevOps practices.'
        },
        {
            'category': books,
            'name': 'Clean Code',
            'slug': 'clean-code',
            'price': Decimal('44.99'),
            'stock': 40,
            'description': 'Essential reading for software developers.'
        },
    ]
    
    for product_data in products:
        product, created = Product.objects.get_or_create(
            slug=product_data['slug'],
            defaults=product_data
        )

if __name__ == '__main__':
    setup_sample_data()
