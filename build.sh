#!/usr/bin/env bash
# Render build script — runs before the app starts

set -o errexit  # exit on error

pip install -r requirements.txt

python manage.py collectstatic --noinput

python manage.py migrate

# Load initial product and category data
python manage.py loaddata shop/fixtures/initial_data.json
