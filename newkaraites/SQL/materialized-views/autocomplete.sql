-- Autocomplete MV every time that autocomplete table changes must recreate this MV
-- Todo: create a trigger to avoid this manual process

CREATE MATERIALIZED VIEW autocomplete_view AS
SELECT id, word_en, word_count, classification
FROM karaites_autocomplete
ORDER BY  classification, word_en, word_count;

DROP INDEX IF EXISTS autocomplete_en;
CREATE INDEX autocomplete_en ON karaites_autocomplete USING GIN (to_tsvector('english', word_en));

-- DROP INDEX IF EXISTS  autocomplete_he;
-- CREATE INDEX autocomplete_he ON karaites_autocomplete USING GIN (to_tsvector('hebrew', word_he));

REFRESH MATERIALIZED VIEW autocomplete_view;