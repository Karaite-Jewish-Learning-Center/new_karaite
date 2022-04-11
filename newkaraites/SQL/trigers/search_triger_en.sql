CREATE TRIGGER content_search_update_en
    BEFORE INSERT OR UPDATE
    ON Karaites_FullTextSearch
    FOR EACH ROW
EXECUTE PROCEDURE
    tsvector_update_trigger(text_en_search, 'pg_catalog.english', text_en);
-- Force triggers to run and populate the text_search column.
UPDATE Karaites_FullTextSearch
set ID = ID;