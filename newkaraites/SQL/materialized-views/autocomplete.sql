-- Autocomplete MV

CREATE MATERIALIZED VIEW  autocomplete_view AS
SELECT word_en, word_count
FROM karaites_autocomplete
ORDER BY word_en, word_count;

DROP INDEX IF EXISTS  autocomplete_idx;
DROP INDEX IF EXISTS  autocomplete_en;
CREATE INDEX autocomplete_en ON karaites_autocomplete USING GIN (to_tsvector('english', word_en));

DROP INDEX IF EXISTS  autocomplete_he;
CREATE INDEX autocomplete_he ON karaites_autocomplete USING GIN (to_tsvector('english', word_en));

REFRESH MATERIALIZED VIEW autocomplete_view;