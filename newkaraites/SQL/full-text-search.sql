-- without similarity
SELECT id, reference_en, text_en, ts_rank_cd(text_en_search, query) AS rank
FROM karaites_fulltextsearch, to_tsquery('god') query
WHERE query @@ text_en_search ORDER BY rank DESC

-- with similarity
SELECT id, reference_en, text_en, ts_rank_cd(text_en_search, query) AS rank
FROM karaites_fulltextsearch, to_tsquery('gof') query,  SIMILARITY('gof',text_en) AS similarity
WHERE query @@ text_en_search OR similarity > 0 ORDER BY rank DESC