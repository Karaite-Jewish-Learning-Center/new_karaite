# log as root and update the system   

create a production user

```
$ adduser -m production
$ adduser production sudo
$ passwd production
$ login production
```

````
copy the public key to server in /home/production/.ssh/authorized_keys

cat ~/.ssh/kjlc.pub
copy the output
echo past the output >> ~/.ssh/authorized_keys


chmod -R go= ~/.ssh

if you are not in bash shell

chsh

Enter your password and state the path to the shell you want to use.

For Bash that would be /bin/bash. For Zsh that would be /usr/bin/zsh.
```

goto site https://docs.conda.io/projects/miniconda/en/latest/miniconda-install.html`

copy the link for the 64 bit linux installer

```
on the server

wget link to installer

sha256sum Miniconda3-latest-Linux-x86_64.sh

check that the hash matches the one on the website

bash Miniconda3-latest-Linux-x86_64.sh

chmod +x Miniconda3-latest-Linux-x86_64.sh

./Miniconda3-latest-Linux-x86_64.sh

create the conda environment

conda create -n pro python=3.8


# set ssh keys for github
ssh-keygen

copy public key to github in settings

test connection

ssh -T git@github.com
Hi SandroFernandes! You've successfully authenticated, but GitHub does not provide shell access.

# install ssh-agent
Add to the end .bashrc

```bash
# SSH Agent should be running, once
run_count=$(ps -ef | grep "ssh-agent" | grep -v "grep" | wc -l)
if [ $run_count -eq 0 ]; then
    echo Starting SSH Agent
    eval $(ssh-agent -s)
    ssh-add ~/.ssh/your key
fi
```

# Kill agent when you are done
# add to ~/.bash_logout
```bash
killall ssh-agent
```

login and logout to test
should see:

Starting SSH Agent
Agent pid 3414

conda activate pro
cd miniconda3/envs/pro

git clone git@github.com:Karaite-Jewish-Learning-Center/new_karaite.git

conda env config vars set CONDA_DEFAULT_ENV="PRO"

# need to install build-essential for fasttext
sudo apt install build-essential 

install requirements
pip install -r requirements.txt

install nginx

sudo apt-get install nginx
sudo apt-get install postgresql postgresql-contrib

## test if nginx has access to the dierectories

sudo -u www-data stat /home/production/static

## very important to avoid the error 13 permission denied
gpasswd -a www-data production

# configure nginx to show a simple page we are in maintenance mode
# create and index.html file in /var/www/html
remove the default file in /etc/nginx/sites-enabled
create a kjlc.conf file in /etc/nginx/sites-enabled
```
<!DOCTYPE html>
<html>
<head>
<title>Welcome to karaites!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to Karaites!</h1>
<p>

Dear Users,

We are currently performing scheduled maintenance on our server. We apologize for any inconvenience this may cause and appreciate your patience during this time.

Our team is working diligently to ensure the server is back up and running smoothly as quickly as possible. This maintenance is part of our commitment to providing you with the best service >

Thank you for your understanding and support.
</p>

</body>
</html>
```

nginx -t
if all ok 
    nginx -s reload
    
test the page in the browser
http://http://kjlc.karaites.org/

install certbot for https
snap install --classic certbot

certbot --nginx


## database

$ pd_dump  kariates_test > karaites.sql

# transfer the file to the server
$ scp karaites.sql -i  ~/.ssh/kjlc production@164.92.72.106:/home/production/

# log on to the server
sudo -u postgres  psql
create database karaites;

# restore the database
sudo -i -u postgres psql -d karaites < karaites.sql

# must set the password for the production user
# create user
sudo -i -u postgres psql -d karaites
create user production with password 'password';
grant all privileges on database karaites to production;
CREATE SCHEMA production AUTHORIZATION production;
ALTER ROLE production SET client_encoding TO 'utf8';
ALTER ROLE production SET default_transaction_isolation TO 'read committed';
ALTER ROLE production SET timezone TO 'UTC';

EWmyxsHd0r3Kfpu3