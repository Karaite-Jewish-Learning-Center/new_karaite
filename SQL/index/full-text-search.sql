--connect to database
--> \c Karaites
DROP INDEX IF EXISTS full_en;
CREATE INDEX full_en ON karaites_fulltextsearch USING GIN (to_tsvector('english', reference_en || ' ' || text_en));

DROP INDEX IF EXISTS full_he;
CREATE INDEX full_he ON karaites_fulltextSearchHebrew USING GIN (to_tsvector('hebrew', reference_he || ' ' || text_he));

-- query index
SELECT
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename = 'karaites_fulltextsearch';


-- create index for english considering all words including stop words 
-- keep stem words

DROP INDEX IF EXISTS full_en;

DROP TEXT SEARCH CONFIGURATION IF EXISTS my_english;

CREATE TEXT SEARCH CONFIGURATION my_english (COPY = english);
ALTER TEXT SEARCH CONFIGURATION my_english 
ALTER MAPPING FOR asciiword, word 
WITH english_stem;


CREATE INDEX full_en 
ON karaites_fulltextsearch 
USING GIN (to_tsvector('english', reference_en || ' ' || text_en));

-- test
SELECT * FROM karaites_fulltextsearch WHERE to_tsvector('my_english', reference_en || ' ' || text_en) @@ to_tsquery('my_english', 'the');

-- used on search code plain search
SELECT id, path, reference_en, ts_rank_cd(text_en_search, query) AS rank FROM karaites_fulltextsearch, phraseto_tsquery('{}') AS query WHERE query @@ text_en_search  ORDER BY rank DESC LIMIT {} OFFSET {}

-- used on search code phrase search
SELECT id, path, reference_en, ts_rank_cd(text_en_search, query) AS rank FROM karaites_fulltextsearch, plainto_tsquery('{}') AS query WHERE query @@ text_en_search  ORDER BY rank DESC LIMIT {} OFFSET {}



