# Generated by Django 4.1 on 2025-02-25 20:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0093_karaitesbookdetails_kedushot_order_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='menuitems',
            name='complement',
            field=models.CharField(default='', max_length=100, verbose_name='Complement'),
        ),
        migrations.AlterField(
            model_name='menuitems',
            name='menu_item',
            field=models.CharField(default='', max_length=100, verbose_name='Menu Item'),
        ),
    ]
