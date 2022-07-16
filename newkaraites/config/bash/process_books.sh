#!/bin/bash

ME="production"
NAME="prod"

# django app dir
DJANGODIR=/home/production/anaconda3/envs/pro/new_karaite/newkaraites

USER=production
GROUP=production
NUM_WORKERS=1

DJANGO_SETTINGS_MODULE=newkaraites.settings
DJANGO_WSGI_MODULE=newkaraites.wsgi
echo "Starting $NAME as `whoami`"

# Activate the virtual environment

conda activate pro
cd $DJANGODIR
echo "Virtual environment: `pwd`"

python manage.py process_books
python manage.py process_intro_he_en

