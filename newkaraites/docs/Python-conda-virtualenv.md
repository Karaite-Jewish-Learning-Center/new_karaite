### Install conda 
#### go to site:https://www.anaconda.com/distribution/
#### find linux distribution, copy link, and download

```bash
$ cd /tmp
$ wget https://repo.anaconda.com/archive/Anaconda3-2020.02-Linux-x86_64.sh
```

#### check package

```bash
$ sha256sum Anaconda3-2020.02-Linux-x86_64.sh
```

#### install conda
```bash
$ bash Anaconda3-2020.02-Linux-x86_64.sh
```
#### update shell
```bash
$ source ~/.baschrc
```
#### update conda
```bash
$ conda update conda
```
#### create conda virtual env
```bash
$ conda create -n dev python=3.8.3
```

#### activate conda virtualenv, and change dir
```bash
$ conda activate dev
$ cd Anaconda3/envs/dev
```

#### install dependencies

```bash
$ sudo apt-get install libpq-dev
```

#### install requirements.txt, test python and django

```.bash
$ pip install -r requirements.txt
$ python
Python 3.8.3 (default, Jul  2 2020, 16:21:59) 
[GCC 7.3.0] :: Anaconda, Inc. on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> import django
>>> django.__version__
>>> '3.0.7'
>>> quit()
```

#### optionally install ipython
```bash
$ pip install ipython
$ ipython
Python 3.8.3 (default, Jul  2 2020, 16:21:59) 
Type 'copyright', 'credits' or 'license' for more information
IPython 7.16.1 -- An enhanced Interactive Python. Type '?' for help.

In [1]: quit
```

#### Create Conda Variables
$ conda env config vars -h
usage: conda-env config vars [-h] {list,set,unset} ...

Interact with environment variables associated with Conda environments

Options:

positional arguments:
  {list,set,unset}
    list            List environment variables for a conda environment
    set             Set environment variables for a conda environment
    unset           Unset environment variables for a conda environment

optional arguments:
  -h, --help        Show this help message and exit.

examples:
    conda env config vars list -n my_env
    conda env config vars set MY_VAR=something OTHER_THING=ohhhhya
    conda env config vars unset MY_VAR


### list variables
$ conda env config vars list -n dev

### set variable LOCAL for local development

$ conda env config vars set CONDA_DEFAULT_ENV="LOCAL"

### set to DEV for development server
$ conda env config vars set CONDA_DEFAULT_ENV="DEV"

### set to PROD for production  server
$ conda env config vars set CONDA_DEFAULT_ENV="PROD"