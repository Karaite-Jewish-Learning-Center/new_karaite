#Order of execution:

All commands are executed: ./manage command name

#must activate conda environment

$ conda activate dev | prod
$ cd anaconda3/envs/dev/newkaraites/newkaraites/

#Bible books

biblical_books, has no dependencies

# Never run this commands again, unless you know what you are doing
# this command will delete all data in the database
# and will recreate it from the bible books
# all manual editions will be lost
# you have been warned !!

>>./manage.py populate_book_details

>>./manage.py biblical_books

# These can be run on a book basis
>>./manage.py process_books

>>./manage.py process_intro_he_en
 
# These can run as many times as you like
>>./manage.py update_refs
 
>>./manage.py create_hebrew_search  

>>./manage.py create_hebrew_rank_search

[//]: # (Update autocomplete)

[//]: # ()
[//]: # (# this can take a while so in the remote server )

[//]: # (>> screen)

[//]: # (>>./manage.py autocomplete | autocomplete1)

[//]: # (# press ctrl A and then ctrl d)

[//]: # (# this will detach the process from the current ssh session)

[//]: # (# you may close the ssh, the process will keep running on remote server.)