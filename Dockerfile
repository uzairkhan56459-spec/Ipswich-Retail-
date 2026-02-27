FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Dummy key only used at build time for collectstatic — overridden at runtime
ENV SECRET_KEY=build-time-placeholder-key-not-used-in-production

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && gunicorn --bind 0.0.0.0:$PORT wsgi:application"]
