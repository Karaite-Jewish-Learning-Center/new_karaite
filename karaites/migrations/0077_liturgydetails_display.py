# Generated by Django 4.1 on 2023-04-18 15:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0076_liturgydetails_alter_method_options_liturgybook'),
    ]

    operations = [
        migrations.AddField(
            model_name='liturgydetails',
            name='display',
            field=models.CharField(default='1', help_text='1) Hebrew on Left. Transliteration on right.                                    Each verse has its translation below it. ', max_length=1, verbose_name='Display'),
        ),
    ]
