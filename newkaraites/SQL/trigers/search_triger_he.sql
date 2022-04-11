CREATE TRIGGER content_search_update_he
    BEFORE INSERT OR UPDATE
    ON Karaites_FullTextSearch
    FOR EACH ROW
EXECUTE PROCEDURE
     tsvector_update_trigger(text_he_search, 'pg_catalog.simple', text_he);
-- Force triggers to run and populate the text_search column.
UPDATE Karaites_FullTextSearch
set ID = ID;