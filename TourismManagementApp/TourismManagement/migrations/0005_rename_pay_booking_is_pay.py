# Generated by Django 5.0.3 on 2024-10-02 07:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('TourismManagement', '0004_rename_tour_id_tourimage_tour'),
    ]

    operations = [
        migrations.RenameField(
            model_name='booking',
            old_name='pay',
            new_name='is_pay',
        ),
    ]
