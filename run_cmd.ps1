Set-Location "d:\Client Projects\Django-Ecommerce_Web 2-19-2026\E-commerce"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
& ".\.venv\Scripts\python.exe" manage.py populate_product_images --overwrite
