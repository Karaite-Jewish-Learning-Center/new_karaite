#Order of execution:

All commands are executed: ./manage command name

#must activate conda environment

$ conda activate dev | prod
$ cd anaconda3/envs/dev/newkaraites/newkaraites/

#Bible books

biblical_books, has no dependencies

>> ./manage.py biblical_books

Process all books

>> ./manage.py populate_book_details

>>./manage.py process_books
   
>> ./manage.py process_intro_he_en
 
>> ./manage.py create_hebrew_search   

>> ./manage.py create_hebrew_rank_search

[//]: # (Update autocomplete)

[//]: # ()
[//]: # (# this can take a while so in the remote server )

[//]: # (>> screen)

[//]: # (>>./manage.py autocomplete | autocomplete1)

[//]: # (# press ctrl A and then ctrl d)

[//]: # (# this will detach the process from the current ssh session)

[//]: # (# you may close the ssh, the process will keep running on remote server.)