# Ipswich Retail — Django E-Commerce Web App

A full-stack e-commerce web application built with Django 4.2, featuring product browsing, a session-based shopping cart, and order management. Developed as a university project.

---

## Features

- **Product Catalogue** — Browse all products or filter by category with a sidebar
- **Product Detail Pages** — View full description, price, stock status, and add to cart
- **Shopping Cart** — Session-based cart with quantity controls and item removal
- **Checkout & Orders** — Place orders with shipping details and get an order confirmation page
- **Django Admin** — Full admin panel to manage products, categories, and orders
- **Image Support** — Product images stored in media folder; auto-populate command included
- **Responsive UI** — Bootstrap 5 layout, works on desktop and mobile
- **Static File Serving** — WhiteNoise for serving static files in production
- **CI/CD Pipeline** — GitHub Actions workflow with testing, Docker build, and deploy stages
- **Docker Support** — Docker Compose setup with PostgreSQL for containerised deployment

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 4.2.7 |
| Database (dev) | SQLite |
| Database (prod) | PostgreSQL 15 |
| Frontend | Bootstrap 5.3.2, Font Awesome 6.5.1 |
| Static Files | WhiteNoise 6.6.0 |
| Image Handling | Pillow 11.0.0 |
| HTTP Requests | requests 2.31.0 |
| Containerisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Render (e-commerce-irq9.onrender.com) |

---

## Project Structure

```
E-commerce/
├── shop/                        # Main Django app
│   ├── cart/                    # Shopping cart sub-app (session-based)
│   ├── orders/                  # Orders sub-app
│   ├── management/
│   │   └── commands/
│   │       └── populate_product_images.py   # Auto-download product images
│   ├── migrations/              # Database migrations
│   ├── templates/
│   │   └── shop/
│   │       ├── base.html        # Base layout (navbar, footer)
│   │       ├── product/         # Home, list, detail templates
│   │       ├── cart/            # Cart detail template
│   │       └── orders/          # Order confirmation template
│   ├── models.py                # Category, Product, Order, OrderItem
│   ├── views.py                 # Home, product list/detail, about, contact, blog
│   ├── urls.py                  # Shop URL routes
│   └── admin.py                 # Admin panel configuration
├── media/                       # Uploaded product images (auto-created)
├── db.sqlite3                   # SQLite database (development)
├── settings.py                  # Django settings
├── urls.py                      # Root URL configuration
├── manage.py                    # Django management CLI
├── requirements.txt             # Python dependencies
├── docker-compose.yml           # Docker Compose (web + PostgreSQL)
├── Dockerfile                   # Docker image definition
└── django-ci.yml                # GitHub Actions CI/CD pipeline
```

---

## URL Routes

| URL | Description |
|---|---|
| `/` | Home page — all products |
| `/shop/` | All products with category filter sidebar |
| `/category/<slug>/` | Products filtered by category |
| `/<id>/<slug>/` | Single product detail page |
| `/about/` | About page |
| `/contact/` | Contact page |
| `/blog/` | Blog page |
| `/cart/` | View shopping cart |
| `/cart/add/<id>/` | Add product to cart |
| `/cart/remove/<id>/` | Remove product from cart |
| `/orders/create/` | Checkout — place an order |
| `/orders/placed/<id>/` | Order confirmation |
| `/admin/` | Django Admin panel |

---

## Database Models

### Category
- `name` — Category display name
- `slug` — URL-friendly identifier

### Product
- `category` — ForeignKey to Category
- `name`, `slug` — Product name and URL slug
- `image` — Uploaded image stored at `media/products/YYYY/MM/DD/`
- `description` — Full text description
- `price` — Decimal price
- `stock` — Available quantity
- `available` — Boolean visibility flag

### Order
- Customer details: name, email, address, postal code, city
- `status` — pending / processing / shipped / delivered / cancelled
- `total_price`

### OrderItem
- `order` — ForeignKey to Order
- `product` — ForeignKey to Product
- `price`, `quantity`

---

## Local Setup

### Prerequisites
- Python 3.9+
- pip

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd E-commerce

# 2. Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py migrate

# 5. Create admin superuser
python manage.py createsuperuser

# 6. (Optional) Download product images automatically
python manage.py populate_product_images

# 7. Start development server
python manage.py runserver
```

Open `http://127.0.0.1:8000` in your browser.

---

## Docker Setup

```bash
# Build and start web app + PostgreSQL
docker-compose up --build

# Run migrations inside the container
docker-compose exec web python manage.py migrate

# Create superuser inside the container
docker-compose exec web python manage.py createsuperuser
```

Open `http://localhost:8000` in your browser.

---

## Product Image Management

A custom management command downloads matching images from Unsplash based on product names:

```bash
# Download images for products that have none
python manage.py populate_product_images

# Re-download images for all products (including those already with one)
python manage.py populate_product_images --overwrite
```

The command matches product names to keywords (e.g. "denim jacket", "laptop", "coffee machine") and saves an appropriate royalty-free photo to the `media/` folder.

---

## Admin Panel

Access at `http://127.0.0.1:8000/admin/` using your superuser credentials.

From the admin panel you can:
- Add, edit, and delete **Products** and **Categories**
- Upload product **images**
- View and update **Orders** and their status
- Manage **Order Items**

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | Django secret key | Insecure dev key (change in production) |
| `DEBUG` | Debug mode | `True` |
| `DATABASE_URL` | PostgreSQL connection string | Falls back to SQLite if not set |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts | `*` |

---

## CI/CD Pipeline

The `django-ci.yml` GitHub Actions workflow runs automatically on every push to `main` or `develop`:

1. **Test** — Runs across Python 3.9, 3.10, and 3.11 with a PostgreSQL service container
   - Linting with `flake8`
   - Security scanning with `bandit` and `safety`
   - Django test suite (`python manage.py test`)
   - Coverage report generated and uploaded to Codecov

2. **Build** — Builds the Docker image and smoke-tests it on port 8000

3. **Deploy** — Triggered on merges to `main` (deploy step configurable per hosting provider)

---

## Viewing the Database

**Option 1 — Django Admin (recommended):**
```
http://127.0.0.1:8000/admin/
```

**Option 2 — Django Shell:**
```bash
python manage.py shell
```
```python
from shop.models import Product, Category, Order
Product.objects.all().values('id', 'name', 'price')
Order.objects.all()
```

**Option 3 — DB Browser for SQLite:**
Download from [sqlitebrowser.org](https://sqlitebrowser.org), open `db.sqlite3`, and browse the `shop_product`, `shop_category`, and `shop_order` tables directly.

---

## Requirements

```
Django==4.2.7
pillow==11.0.0
psycopg2-binary==2.9.11
gunicorn==21.2.0
whitenoise==6.6.0
django-environ==0.11.2
requests==2.31.0
dj-database-url==2.1.0
```
