DROP TEXT SEARCH DICTIONARY IF EXISTS  hebrew_hunspell CASCADE;
   CREATE TEXT SEARCH DICTIONARY hebrew_hunspell (
    TEMPLATE  = ispell,
    DictFile  = he_IL,
    AffFile   = he_IL,
    StopWords = he_IL
    );
CREATE TEXT SEARCH CONFIGURATION public.hebrew (
    COPY = pg_catalog.simple
  );
  ALTER TEXT SEARCH CONFIGURATION hebrew
    ALTER MAPPING
    FOR
        blank
    WITH
        hebrew_hunspell, simple;