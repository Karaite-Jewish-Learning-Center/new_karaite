

CREATE MATERIALIZED VIEW autocomplete_view AS
SELECT id, word_en, word_count, classification
FROM karaites_autocomplete
ORDER BY  classification, word_en, word_count;

DROP INDEX IF EXISTS autocomplete_en;
CREATE INDEX autocomplete_en ON karaites_autocomplete USING GIN (to_tsvector('english', word_en));

REFRESH MATERIALIZED VIEW autocomplete_view;