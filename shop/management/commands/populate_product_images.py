"""
Management command to download and assign product images from Unsplash.
Matches images to products based on product name keywords.

Usage:
    python manage.py populate_product_images
    python manage.py populate_product_images --overwrite   # re-download even if image exists
"""

import os
import io
from datetime import date
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from shop.models import Product

try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False


# Curated Unsplash photo IDs mapped to product keywords.
# Format: list of (keywords, photo_id) sorted by specificity (most specific first).
KEYWORD_IMAGE_MAP = [
    # Clothing & Fashion
    (['denim jacket', 'jean jacket'], '1542272604-787c3835535d'),
    (['leather jacket'], '1520975954-7f2c0e95-9e11-4e7a-b85d'),
    (['hoodie', 'sweatshirt'], '1556821840-3a63f8a79d4d'),
    (['t-shirt', 'tshirt', 'tee shirt'], '1521572163474-6864f9cf17ab'),
    (['shirt', 'blouse', 'top'], '1503342217505-b0a15ec3261c'),
    (['dress', 'gown'], '1515372394-03aa7a47e06c'),
    (['pants', 'trousers', 'jeans'], '1542060748-b4d59f46e5e6'),
    (['shorts'], '1565099824688-05fb88e95c64'),
    (['skirt'], '1583743814966-8d4f25c4ddb4'),
    (['coat', 'overcoat'], '1539533113208-f19d8573b776'),
    (['sweater', 'jumper', 'pullover'], '1586363104862-3a5e2ab60d99'),
    (['suit'], '1594938298603-e671e14c3d60'),
    (['scarf'], '1516762689617-e1cffcef479d'),
    (['hat', 'cap', 'beanie'], '1521369909449-b929a898e576'),
    (['gloves'], '1544723940-1fc03d5a0c11'),
    (['socks'], '1586363104862-3a5e2ab60d99'),
    (['underwear', 'lingerie'], '1618898909019-010e4e234c3d'),
    (['swimsuit', 'bikini', 'swimwear'], '1507003211169-0a1dd7228f2d'),

    # Shoes & Footwear
    (['sneakers', 'sneaker', 'trainers'], '1542291026-7eec264c27ff'),
    (['running shoes', 'athletic shoes'], '1542291026-7eec264c27ff'),
    (['boots', 'ankle boots', 'chelsea boots'], '1543163521-1bf539c55dd2'),
    (['heels', 'high heels', 'pumps'], '1543163521-1bf539c55dd2'),
    (['sandals', 'flip flops'], '1519689373023-dd07c7988509'),
    (['loafers', 'oxfords', 'dress shoes'], '1543163521-1bf539c55dd2'),
    (['shoes'], '1542291026-7eec264c27ff'),

    # Electronics & Tech
    (['laptop', 'notebook computer'], '1496181133206-80ce9b88a853'),
    (['macbook'], '1517336714731-489689fd1ca8'),
    (['iphone', 'samsung', 'smartphone', 'mobile phone', 'cell phone'], '1592750475338-74b7b21085ab'),
    (['phone', 'cellphone'], '1511707171634-5f897ff02aa9'),
    (['tablet', 'ipad'], '1517336714731-489689fd1ca8'),
    (['headphones', 'earphones', 'earbuds', 'airpods'], '1505740420928-5e560c06d30e'),
    (['camera', 'dslr', 'mirrorless'], '1516035069371-29a1b244cc32'),
    (['smart watch', 'apple watch', 'fitness tracker'], '1523275335684-37898b6baf30'),
    (['speaker', 'bluetooth speaker'], '1608043152269-423dbba4e7e1'),
    (['gaming', 'console', 'playstation', 'xbox'], '1587095951604-b9d924a3fda0'),
    (['keyboard'], '1587829741301-dc798b83add3'),
    (['mouse'], '1527864550417-7fd91fc51a46'),
    (['monitor', 'display screen'], '1527443224154-2516cda5d4a3'),
    (['drone'], '1508444845599-5c89863b1c44'),
    (['printer'], '1612198790289-6b9a20d4e55b'),

    # Books & Media
    (['clean code', 'code book'], '1544716278-ca5e3f4abd8c'),
    (['programming', 'coding book', 'software book'], '1544716278-ca5e3f4abd8c'),
    (['book', 'novel', 'textbook', 'guide', 'manual'], '1544716278-ca5e3f4abd8c'),
    (['comic', 'manga'], '1612198790289-6b9a20d4e55b'),
    (['magazine', 'journal'], '1543002588-a651f7d8b0c3'),
    (['notebook', 'planner', 'diary', 'journal'], '1544947950-fa07a98d237f'),

    # Kitchen & Coffee
    (['espresso machine', 'espresso coffee', 'coffee machine', 'coffee maker'], '1514228742587-6b1558fcca3d'),
    (['coffee', 'latte', 'cappuccino'], '1514228742587-6b1558fcca3d'),
    (['blender'], '1570197788417-0e82375c9371'),
    (['toaster'], '1612198790289-6b9a20d4e55b'),
    (['microwave'], '1573225342350-16731dd9bf3d'),
    (['air fryer'], '1574894709920-11b28e7367e3'),
    (['kettle', 'electric kettle'], '1559839914-17aae19cec71'),
    (['mug', 'coffee mug', 'cup'], '1514228742587-6b1558fcca3d'),
    (['pot', 'saucepan', 'pan', 'cookware'], '1556909211-36987daf7b4d'),
    (['knife', 'cutting board', 'kitchen set'], '1556909211-36987daf7b4d'),

    # Home & Furniture
    (['sofa', 'couch', 'chair'], '1555041469-a586c61ea9bc'),
    (['table', 'desk'], '1555041469-a586c61ea9bc'),
    (['lamp', 'light', 'lighting'], '1507473885765-e6ed057f782c'),
    (['mirror'], '1549887552-cb1071d3b767'),
    (['rug', 'carpet'], '1555041469-a586c61ea9bc'),
    (['curtain', 'blinds'], '1555041469-a586c61ea9bc'),
    (['pillow', 'cushion'], '1586023492125-27b2c045efd7'),
    (['blanket', 'throw', 'comforter', 'duvet'], '1555041469-a586c61ea9bc'),
    (['vase', 'planter', 'plant pot'], '1485955900006-10f4d324d411'),
    (['candle', 'diffuser'], '1602028915047-37269d1a73f7'),
    (['picture frame', 'photo frame', 'wall art'], '1513519245088-8b54afbf32b7'),
    (['clock', 'wall clock'], '1523275335684-37898b6baf30'),

    # Beauty & Personal Care
    (['perfume', 'cologne', 'fragrance'], '1541643600914-78b084683702'),
    (['makeup', 'cosmetics', 'lipstick', 'foundation'], '1522335789203-aabd1fc54bc9'),
    (['skincare', 'moisturizer', 'serum', 'face cream'], '1571781926291-c477ebfd024b'),
    (['shampoo', 'conditioner', 'hair care'], '1556228578-8c89e6adf883'),
    (['soap', 'body wash', 'shower gel'], '1607006344335-8f38c32b0f9c'),
    (['deodorant', 'antiperspirant'], '1607006344335-8f38c32b0f9c'),
    (['razor', 'shaving'], '1607006344335-8f38c32b0f9c'),
    (['toothbrush', 'toothpaste', 'dental'], '1607006344335-8f38c32b0f9c'),

    # Sports & Fitness
    (['yoga mat', 'yoga'], '1544367654-cf4cf6e39d08'),
    (['dumbbell', 'weights', 'barbell'], '1576678927484-cc907957088c'),
    (['bicycle', 'bike', 'cycling'], '1558618666-fcd25c85cd64'),
    (['treadmill', 'exercise bike', 'gym equipment'], '1576678927484-cc907957088c'),
    (['tennis racket', 'badminton racket'], '1595435742919-5c37bec6e916'),
    (['football', 'soccer ball'], '1575361204480-aadea25e6e68'),
    (['basketball'], '1546519638-68e109498ffc'),
    (['swimming', 'swim goggles'], '1560090995-3ef0deb5d6e9'),
    (['backpack', 'hiking backpack'], '1553062407-98eeb64c6a62'),
    (['water bottle', 'sports bottle'], '1559839914-17aae19cec71'),
    (['sunglasses', 'sunglass'], '1509695507497-9a52b232ff02'),

    # Bags & Accessories
    (['handbag', 'purse', 'clutch'], '1548036161-98c5be19f695'),
    (['tote bag', 'tote'], '1548036161-98c5be19f695'),
    (['wallet', 'card holder'], '1627123424574-724758594e93'),
    (['belt'], '1553062407-98eeb64c6a62'),
    (['watch'], '1523275335684-37898b6baf30'),
    (['jewelry', 'necklace', 'bracelet', 'earrings', 'ring'], '1599643478518-a784e5dc4c8f'),
    (['keychain'], '1591561954557-26941169b49e'),
    (['umbrella'], '1602928321679-560bb453f190'),

    # Food & Beverage
    (['chocolate', 'candy', 'sweets'], '1481391319998-d4d4e2fc9f12'),
    (['wine', 'champagne'], '1510812431401-41d2bd2722f3'),
    (['tea', 'green tea'], '1556679343-c7306c1976bc'),
    (['honey'], '1471943311424-646960669fbc'),
    (['nuts', 'snacks', 'dried fruits'], '1553979459-d1029b96e8ba'),

    # Toys & Kids
    (['toy', 'doll', 'action figure'], '1558060370-d644479cb6f7'),
    (['lego', 'building blocks'], '1558060370-d644479cb6f7'),
    (['puzzle'], '1558060370-d644479cb6f7'),
    (['board game', 'card game'], '1558060370-d644479cb6f7'),

    # Art & Craft
    (['painting', 'canvas art', 'artwork'], '1513519245088-8b54afbf32b7'),
    (['sculpture', 'figurine', 'statue'], '1578749556568-bc2c40e68b61'),
    (['ceramic', 'pottery'], '1578749556568-bc2c40e68b61'),
    (['handmade', 'artisan', 'craft'], '1578749556568-bc2c40e68b61'),
]

# Fallback image for when no keyword matches
FALLBACK_PHOTO_ID = '1441986300917-64674bd600d8'


def get_photo_id_for_product(product_name: str, category_name: str = '') -> str:
    """Find the best matching Unsplash photo ID for a product."""
    name_lower = product_name.lower()
    category_lower = category_name.lower() if category_name else ''
    combined = f"{name_lower} {category_lower}".strip()

    for keywords, photo_id in KEYWORD_IMAGE_MAP:
        for keyword in keywords:
            if keyword in combined:
                return photo_id

    return FALLBACK_PHOTO_ID


def download_image(photo_id: str, width: int = 800, height: int = 600) -> bytes | None:
    """Download an image from Unsplash by photo ID."""
    url = f"https://images.unsplash.com/photo-{photo_id}?w={width}&h={height}&fit=crop&q=80"
    headers = {
        'User-Agent': (
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
            'AppleWebKit/537.36 (KHTML, like Gecko) '
            'Chrome/120.0.0.0 Safari/537.36'
        )
    }
    try:
        response = requests.get(url, headers=headers, timeout=15)
        if response.status_code == 200:
            return response.content
        return None
    except Exception:
        return None


class Command(BaseCommand):
    help = 'Download and assign product images from Unsplash based on product names'

    def add_arguments(self, parser):
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Re-download images even if product already has one',
        )

    def handle(self, *args, **options):
        if not HAS_REQUESTS:
            self.stderr.write(self.style.ERROR('requests library not installed. Run: pip install requests'))
            return

        overwrite = options['overwrite']
        products = Product.objects.select_related('category').all()

        if not products.exists():
            self.stdout.write(self.style.WARNING('No products found in database.'))
            return

        self.stdout.write(f'Processing {products.count()} product(s)...\n')
        success_count = 0
        skip_count = 0
        fail_count = 0

        today = date.today()
        upload_subpath = f"products/{today.year}/{today.month:02d}/{today.day:02d}"

        for product in products:
            if product.image and not overwrite:
                self.stdout.write(f'  SKIP  {product.name} (already has image)')
                skip_count += 1
                continue

            category_name = product.category.name if product.category else ''
            photo_id = get_photo_id_for_product(product.name, category_name)

            self.stdout.write(f'  GET   {product.name} ...')

            image_data = download_image(photo_id)
            if not image_data:
                self.stdout.write(self.style.ERROR(f'  FAIL  {product.name} - could not download image'))
                fail_count += 1
                continue

            # Build a safe filename from product slug
            filename = f"{product.slug}.jpg"
            product.image.save(filename, ContentFile(image_data), save=True)

            self.stdout.write(self.style.SUCCESS(f'  OK    {product.name} -> {product.image.name}'))
            success_count += 1

        self.stdout.write('\n' + '-' * 50)
        self.stdout.write(self.style.SUCCESS(f'Done: {success_count} updated, {skip_count} skipped, {fail_count} failed'))
