--select word_en, word_count from autocomplete_view where word_en like 'the%' order by word_count DESC

select word_en,word_count  from  autocomplete_view where to_tsvector('pg_catalog.none',word_en) @@ to_tsquery('the' || ':*') order by word_count DESC limit 20

select id,word_en, word_count  from  autocomplete_view
                  where to_tsvector('simple_english', word_en) @@ to_tsquery('{search}' || ':*')
                  order by word_count desc limit 15


CREATE TEXT SEARCH DICTIONARY english_ispell (
    TEMPLATE = ispell,
    DictFile = english,
    AffFile = english,
    StopWords = english.stop1
);