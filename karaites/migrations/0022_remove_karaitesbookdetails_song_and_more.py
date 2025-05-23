# Generated by Django 4.0.4 on 2022-06-03 20:42

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0021_alter_booksfootnotes_options_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='karaitesbookdetails',
            name='song',
        ),
        migrations.AddField(
            model_name='karaitesbookdetails',
            name='songs_list',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=100), blank=True, default=list, size=None),
        ),
        migrations.AlterField(
            model_name='booksfootnotes',
            name='language',
            field=models.CharField(choices=[('en', 'English'), ('he', 'Hebrew'), ('he-en', 'Hebrew-English'), ('ja', 'Judeo-Arabic')], max_length=8, verbose_name='Book language'),
        ),
        migrations.AlterField(
            model_name='karaitesbookdetails',
            name='book_classification',
            field=models.CharField(choices=[('00', 'Unknown'), ('10', 'Havdala Songs'), ('15', 'Passover Songs'), ('18', 'Purim Songs'), ('20', 'Prayers'), ('30', 'Shabbat Songs'), ('40', 'Supplemental Readings for specific Torah portions'), ('45', 'Tammuz/Av/Echa'), ('50', 'Wedding Songs'), ('55', 'Poetry'), ('60', 'Polemic'), ('65', 'Exhortatory'), ('70', 'Test'), ('80', 'Comments'), ('90', 'Other')], max_length=2, verbose_name='Classification'),
        ),
        migrations.AlterField(
            model_name='karaitesbookdetails',
            name='book_language',
            field=models.CharField(choices=[('en', 'English'), ('he', 'Hebrew'), ('he-en', 'Hebrew-English'), ('ja', 'Judeo-Arabic')], max_length=8, verbose_name='Book language'),
        ),
    ]
