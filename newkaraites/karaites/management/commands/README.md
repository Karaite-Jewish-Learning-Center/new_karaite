#Order of execution:

All commands are executed: ./manage command name

#must activate conda environment

$ conda activate dev | prod
$ cd anaconda3/envs/dev/newkaraites/newkaraites/

#Bible books

Books, has no dependencies


>> ./manage.py books

Process all books

>>./manage.py process_books
  
Comments (Aaron ben Elijah)

>> ./manage.py comments

Karaite Books (Yeriot Shelomo volume 1 and 2 )

>> ./manage.py karaites_book_as_array

Halakha Adderet book

>> ./manage.py halakha_adderet_book_as_array

Anochi poems

>> ./manage.py anochi_book_as_array

Update references (updates bible references)

>> ./manage.py update_references
 
Update search

>> ./manage.py update_full_text_search


Update autocomplete
# this can take a while so 
>> screen
>>./manage.py autocomplete | autocomplete1
# press ctrl A and then ctrl d
# this will detach the process from the current ssh session
# you may close the ssh, the process will keep running.

