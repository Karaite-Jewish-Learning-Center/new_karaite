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


