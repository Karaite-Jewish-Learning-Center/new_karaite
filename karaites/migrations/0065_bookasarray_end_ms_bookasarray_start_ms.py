# Generated by Django 4.0.4 on 2022-11-01 15:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0064_bookasarrayaudio_end_ms_bookasarrayaudio_start_ms'),
    ]

    operations = [
        migrations.AddField(
            model_name='bookasarray',
            name='end_ms',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='bookasarray',
            name='start_ms',
            field=models.IntegerField(default=0),
        ),
    ]
