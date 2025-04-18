# Generated by Django 3.2 on 2022-04-25 14:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('karaites', '0005_alter_invertedindex_rank'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='invertedindex',
            options={'ordering': ('-rank',), 'verbose_name_plural': 'Inverted index'},
        ),
        migrations.AlterField(
            model_name='invertedindex',
            name='rank',
            field=models.FloatField(db_index=True, default=0, verbose_name='Rank'),
        ),
    ]
