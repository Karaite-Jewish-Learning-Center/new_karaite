# Generated by Django 4.0.4 on 2022-06-16 20:53

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0045_alter_firstlevel_options_alter_secondlevel_options_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='BookClassificationFirst',
        ),
        migrations.DeleteModel(
            name='BookClassificationSecond',
        ),
    ]
