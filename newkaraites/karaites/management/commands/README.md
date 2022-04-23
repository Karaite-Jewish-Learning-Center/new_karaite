#Order of execution:

All commands are executed: ./manage command name

#must activate conda environment

$ conda activate dev | prod
$ cd anaconda3/envs/dev/newkaraites/newkaraites/

#Bible books

biblical_books, has no dependencies


>> ./manage.py biblical_books

Process all books

>>./manage.py process_books
  
Comments (Aaron ben Elijah)

>> ./manage.py comments
 
>> ./manage.py process_intro_he_en
 
Liturgy books

>> ./manage.py karaites_liturgy_as_array

Update references (updates bible references)

>> ./manage.py update_references
 
>> ./manage.py create_hebrew_search   

[//]: # (Update autocomplete)

[//]: # ()
[//]: # (# this can take a while so in the remote server )

[//]: # (>> screen)

[//]: # (>>./manage.py autocomplete | autocomplete1)

[//]: # (# press ctrl A and then ctrl d)

[//]: # (# this will detach the process from the current ssh session)

[//]: # (# you may close the ssh, the process will keep running on remote server.)