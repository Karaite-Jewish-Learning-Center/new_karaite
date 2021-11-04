-- Autocomplete MV

CREATE MATERIALIZED VIEW  autocomplete_view AS
SELECT word_en, word_count
FROM karaites_autocomplete
ORDER BY word_en, word_count;

CREATE INDEX autocomplete_idx ON karaites_autocomplete USING GIN (to_tsvector('english', word_en));

REFRESH MATERIALIZED VIEW autocomplete_view;