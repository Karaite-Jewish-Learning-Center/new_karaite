# Generated by Django 4.0.4 on 2022-07-10 20:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0057_alter_author_name_alter_author_name_he_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='karaitesbookdetails',
            name='published',
            field=models.BooleanField(default=False, help_text='This field is used to inform if the books is published this way is possible to upload a book and process it later', verbose_name='Published'),
        ),
    ]
