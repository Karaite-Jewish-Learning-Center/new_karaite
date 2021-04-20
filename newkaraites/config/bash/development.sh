
ME="develop"
NAME="dev"

# django app dir
DJANGODIR=/home/develop/anaconda3/envs/dev/new_karaites/newkaraite/
# your sock file - do not create it manually
SOCKFILE=/home/develop/sock/gunicorn.sock
USER=develop
GROUP=develop
NUM_WORKERS=1
DJANGO_SETTINGS_MODULE=new_karaites.settings
DJANGO_WSGI_MODULE=new_karaites.wsgi
echo "Starting $NAME as `whoami`"

# Activate the virtual environment

conda activate dev
cd $DJANGODIR
echo "Virtual environment: `pwd`"

# Create the run directory if it doesn't exist
# RUNDIR=$(dirname $SOCKFILE)
# test -d $RUNDIR || mkdir -p $RUNDIR

# Start your Django
exec python manage.py runserver 161.35.130.125:8080