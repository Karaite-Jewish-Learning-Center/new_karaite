# Generated by Django 4.0.4 on 2022-05-26 20:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0016_booksfootnotes'),
    ]

    operations = [
        migrations.RenameField(
            model_name='booksfootnotes',
            old_name='footnotes',
            new_name='footnote',
        ),
    ]
