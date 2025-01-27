ALTER DATABASE karaites_test OWNER to postgres;
ALTER USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE karaites_test TO postgres;
ALTER DATABASE karaites_test RENAME TO karaites;