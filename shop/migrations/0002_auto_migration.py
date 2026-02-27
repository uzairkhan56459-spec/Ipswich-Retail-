from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('shop', '0001_initial'),
    ]
    operations = [
        # 'created' and 'updated' already exist from 0001_initial — only 'stock' is new
        migrations.AddField(model_name='product', name='stock', field=models.PositiveIntegerField(default=0)),
    ]
