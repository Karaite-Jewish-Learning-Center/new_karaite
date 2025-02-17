
## Do this before running the command

```sql

CREATE TEXT SEARCH CONFIGURATION public.english_with_stopwords (COPY = pg_catalog.english);

ALTER TEXT SEARCH CONFIGURATION public.english_with_stopwords
ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
WITH simple, english_stem;
```

```sql
DROP TRIGGER content_search_update_en ON karaites_fulltextsearch;

CREATE TRIGGER content_search_update_en
BEFORE INSERT OR UPDATE
ON karaites_fulltextsearch
FOR EACH ROW
EXECUTE FUNCTION tsvector_update_trigger(text_en_search, 'public.public.hebrew', text_en);

DROP TRIGGER content_search_update_he ON karaites_fulltextsearch_hebrew;

CREATE TRIGGER content_search_update_en
BEFORE INSERT OR UPDATE
ON karaites_fulltextsearch_hebrew
FOR EACH ROW
EXECUTE FUNCTION tsvector_update_trigger(text_he_search, 'public.public.hebrew', text_he);
```


```bash
./manage update_full_text_search
```


```bash
./manage english_words
```

```bash```
./manage create_hebrew_search
```

```bash
./manage create_hebrew_rank_search
```

