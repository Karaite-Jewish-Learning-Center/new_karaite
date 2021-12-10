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

>> ./manage halakha_adderet_as_array

Update references (updates bible references)


>> ./manage.py updates_references
 
2.references_map_html

Update search

>> ./manage.py update_full_text_search

Update autocomplete


>>./manage.py autocomplete | autocomplete1
>

