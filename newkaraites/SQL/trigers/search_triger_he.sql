-- this does not work at all, the parser is not working for Hebrew
DROP TRIGGER IF EXISTS content_search_update_he ON Karaites_FullTextSearchHebrew;
CREATE TRIGGER content_search_update_he
    BEFORE INSERT OR UPDATE
    ON Karaites_FullTextSearchHebrew
    FOR EACH ROW
EXECUTE PROCEDURE
     tsvector_update_trigger(text_he_search, 'public.hebrew', text_he);
-- Force triggers to run and populate the text_search column.
UPDATE Karaites_FullTextSearch
set ID = ID;