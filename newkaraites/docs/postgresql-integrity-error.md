# IntegrityError: duplicate key value violates unique constraint
# DETAIL:  Key (id)=(13) already exists.

Describe as a bug by design, when do a dump and restore
some keys may be out of sync getting the error above

to fix that:

look in navicat design table , click on the key field 
bellow there's a default value, get the name of index

./manage dbshell
 
or
$ psql -h localhost -U postgres

postgres# \c Karaites
psql (13.2, server 10.16)
You are now connected to database "Karaites" as user "postgres".

postgres# SELECT setval('karaites_booktext_id_seq', (SELECT MAX(id) FROM Karaites_booktext))


 That's it !