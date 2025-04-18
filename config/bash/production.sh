#!/bin/bash

ME="production"
NAME="prod"

# django app dir
DJANGODIR=/home/production/miniconda3/envs/pro/new_karaite/newkaraites
# your sock file - do not create it manually
SOCKFILE=/home/production/sock/gunicorn.sock
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

# Start your Django Gunicorn
# Programs meant to be run under supervisor should not demonize themselves (do not use --daemon)

exec gunicorn ${DJANGO_WSGI_MODULE}:application -b 127.0.0.1:9000 \
  --name $NAME \
  --workers $NUM_WORKERS \
  --user=$USER --group=$GROUP \
  --log-level=debug \
  --log-file=/home/production/logs/gunicorn/gunicorn.log


