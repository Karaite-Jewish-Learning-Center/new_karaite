
ME="develop"
NAME="dev"

# django app dir
DJANGODIR=/home/develop/anaconda3/envs/dev/new_karaite/newkaraites
# your sock file - do not create it manually
SOCKFILE=/home/develop/sock/gunicorn.sock
USER=develop
GROUP=develop
NUM_WORKERS=1
DJANGO_SETTINGS_MODULE=newkaraites.settings
DJANGO_WSGI_MODULE=newkaraites.wsgi
echo "Starting $NAME as `whoami`"

# Activate the virtual environment

conda activate dev
cd $DJANGODIR
echo "Virtual environment: `pwd`"

# Create the run directory if it doesn't exist
# RUNDIR=$(dirname $SOCKFILE)
# test -d $RUNDIR || mkdir -p $RUNDIR

# Start your Django
exec gunicorn ${DJANGO_WSGI_MODULE}:application -b 127.0.0.1:8000 \
  --name $NAME \
  --workers $NUM_WORKERS \
  --user=$USER --group=$GROUP \
  --log-level=debug \
  --log-file=/home/develop/logs/gunicorn/gunicorn.log

