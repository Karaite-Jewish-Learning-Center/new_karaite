/**
 * Karaite Texts Library - Main Application
 */

// State
let catalog = null;
let currentText = null;
let showHebrew = true;
let showTransliteration = true;
let showEnglish = true;
let showComments = true;
let commentsMode = localStorage.getItem('commentsMode') || 'inline-english'; // 'inline-english', 'inline-full', 'panel'
let currentTab = 'text';

// Audio state
let audioPlayer = null;
let isPlaying = false;
let currentVerseIndex = -1;
let animationFrameId = null;
let clickToPlayMode = false; // When true, clicking verse note icons plays that verse

// Tanakh-specific audio state (Torah readings split across aliyah MP3s).
let tanakhAudioMode = false;
let tanakhCurrentSegmentUrl = null;
let tanakhActiveVerseNum = -1;

function syncNavbarHeight() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    document.documentElement.style.setProperty('--navbar-height', `${nav.offsetHeight}px`);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    syncNavbarHeight();
    window.addEventListener('resize', syncNavbarHeight);
    // Load catalog
    try {
        const response = await fetch('data/catalog.json');
        catalog = await response.json();
        
        // Check URL hash for direct navigation
        const hash = window.location.hash.slice(1);
        if (hash) {
            if (hash.startsWith('text/')) {
                const textId = hash.slice(5);
                await showText(textId);
            } else if (hash.startsWith('category/')) {
                const cat = decodeURIComponent(hash.slice(9));
                showCategory(cat);
            } else if (hash.startsWith('tanakh/')) {
                const parts = hash.slice(7).split('/');
                const bookId = parts[0];
                const chapter = parseInt(parts[1]) || 1;
                await showTanakhBook(bookId, chapter);
            } else if (hash === 'tanakh') {
                await showTanakh();
            } else if (hash === 'changelog') {
                await showChangelog();
            } else {
                showHome();
            }
        } else {
            showHome();
        }
    } catch (error) {
        console.error('Failed to load catalog:', error);
        document.getElementById('app').innerHTML = `
            <div class="loading">
                <p>Error loading catalog. Please refresh the page.</p>
            </div>
        `;
    }
    
    // Dark mode toggle
    const darkModeToggle = document.getElementById('darkModeToggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    darkModeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });
    
    // Handle browser navigation
    window.addEventListener('hashchange', async () => {
        const hash = window.location.hash.slice(1);
        if (hash.startsWith('text/')) {
            const textId = hash.slice(5);
            await showText(textId);
        } else if (hash.startsWith('category/')) {
            const cat = decodeURIComponent(hash.slice(9));
            showCategory(cat);
        } else if (hash.startsWith('tanakh/')) {
            const parts = hash.slice(7).split('/');
            const bookId = parts[0];
            const chapter = parseInt(parts[1]) || 1;
            await showTanakhBook(bookId, chapter);
        } else if (hash === 'tanakh') {
            await showTanakh();
        } else if (hash === 'changelog') {
            await showChangelog();
        } else {
            showHome();
        }
    });
    
    // Initialize search
    initSearch();
});

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

let searchIndex = null;
let fullTextIndex = null;
let searchReady = false;

async function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    let selectedIndex = -1;
    let currentResults = [];
    
    // Build search index from catalog (titles)
    buildSearchIndex();
    
    // Load full text content in background
    loadFullTextIndex();
    
    // Debounced search
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('visible');
            return;
        }
        
        debounceTimer = setTimeout(async () => {
            currentResults = await performSearch(query);
            selectedIndex = -1;
            renderSearchResults(currentResults, query);
        }, 200);
    });
    
    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (!searchResults.classList.contains('visible')) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, currentResults.length - 1);
            updateSelectedResult();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelectedResult();
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            const result = currentResults[selectedIndex];
            if (result) {
                navigateToResult(result);
            }
        } else if (e.key === 'Escape') {
            searchResults.innerHTML = '';
            searchResults.classList.remove('visible');
            searchInput.blur();
        }
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            searchResults.innerHTML = '';
            searchResults.classList.remove('visible');
        }
    });
    
    // Focus handling
    searchInput.addEventListener('focus', async () => {
        if (searchInput.value.trim().length >= 2) {
            currentResults = await performSearch(searchInput.value.trim());
            renderSearchResults(currentResults, searchInput.value.trim());
        }
    });
    
    function updateSelectedResult() {
        const items = searchResults.querySelectorAll('.search-result-item');
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === selectedIndex);
        });
        if (selectedIndex >= 0 && items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }
}

function buildSearchIndex() {
    if (!catalog) return;
    
    searchIndex = [];
    
    // Index all texts from catalog
    for (const [category, subcats] of Object.entries(catalog)) {
        for (const [subcat, texts] of Object.entries(subcats)) {
            for (const text of texts) {
                const entry = {
                    id: text.id,
                    title_en: text.title_en || '',
                    title_he: text.title_he || '',
                    category: category,
                    subcategory: subcat,
                    type: 'text'
                };
                searchIndex.push(entry);
            }
        }
    }
}

async function loadFullTextIndex() {
    if (!searchIndex) return;
    
    fullTextIndex = {};
    
    // Load all text files in parallel (batched)
    const batchSize = 20;
    for (let i = 0; i < searchIndex.length; i += batchSize) {
        const batch = searchIndex.slice(i, i + batchSize);
        await Promise.all(batch.map(async (entry) => {
            try {
                const response = await fetch(`data/texts/${entry.id}.json`);
                if (response.ok) {
                    const data = await response.json();
                    // Build searchable text from content
                    let fullText = '';
                    if (data.content) {
                        for (const verse of data.content) {
                            if (verse.hebrew) fullText += verse.hebrew + ' ';
                            if (verse.english) fullText += verse.english + ' ';
                            if (verse.transliteration) fullText += verse.transliteration + ' ';
                        }
                    }
                    if (data.introduction) {
                        fullText += data.introduction + ' ';
                    }
                    fullTextIndex[entry.id] = {
                        text: fullText.toLowerCase(),
                        textNormalized: normalizeForSearch(fullText),
                        content: data.content || []
                    };
                }
            } catch (e) {
                // Skip files that don't exist
            }
        }));
    }
    
    searchReady = true;
    console.log('Full text search index ready:', Object.keys(fullTextIndex).length, 'texts');
}

// Generate transliteration variants for fuzzy matching
function getSearchVariants(query) {
    const base = normalizeForSearch(query);
    const variants = new Set([query.toLowerCase(), base]);
    
    // Add ending variants
    if (base.endsWith('ot')) {
        variants.add(base.slice(0, -2) + 'oth');
    } else if (base.endsWith('oth')) {
        variants.add(base.slice(0, -3) + 'ot');
    }
    
    if (base.endsWith('a')) {
        variants.add(base + 'h');
    } else if (base.endsWith('ah')) {
        variants.add(base.slice(0, -1));
    }
    
    // Consonant variants
    const consonantSwaps = [
        ['kh', 'ch'], ['ch', 'kh'],
        ['q', 'k'], ['k', 'q'],
        ['ts', 'tz'], ['tz', 'ts'],
        ['th', 't'],
        ['ph', 'f'], ['f', 'ph'],
        ['v', 'b'], ['b', 'v'],
        ['w', 'v'], ['v', 'w'],
    ];
    
    for (const [from, to] of consonantSwaps) {
        if (base.includes(from)) {
            variants.add(base.replace(new RegExp(from, 'g'), to));
        }
    }
    
    return Array.from(variants);
}

// Normalize text for comparison - strips all diacritics and apostrophes
function normalizeForSearch(text) {
    return text
        .toLowerCase()
        // Remove all apostrophe-like characters
        .replace(/[''`'ʿʾʻʼ״׳ˈˌ\u0027\u2019\u02BC\u02BB\u02BD]/g, '')
        // Vowels with diacritics
        .replace(/[āâàáäăạåǎ]/g, 'a')
        .replace(/[ēêèéëĕẹěė]/g, 'e')
        .replace(/[īîìíïĭịǐ]/g, 'i')
        .replace(/[ōôòóöŏọőǒ]/g, 'o')
        .replace(/[ūûùúüŭụůǔ]/g, 'u')
        // Consonants with diacritics
        .replace(/[ḥḫẖħ]/g, 'h')
        .replace(/[ṭṯẗť]/g, 't')
        .replace(/[ṣśšşŝ]/g, 's')
        .replace(/[ẓźżž]/g, 'z')
        .replace(/[ḳḵǩḱķ]/g, 'k')
        .replace(/[ḍḏď]/g, 'd')
        .replace(/[ṇṅñň]/g, 'n')
        .replace(/[ṃ]/g, 'm')
        .replace(/[ṛṟř]/g, 'r')
        .replace(/[ḷḻľļł]/g, 'l')
        .replace(/[ḡǧğĝ]/g, 'g')
        .replace(/[ḇ]/g, 'b')
        .replace(/[ṗṕ]/g, 'p')
        .replace(/[ċč]/g, 'c')
        .replace(/[ẇŵ]/g, 'w')
        .replace(/[ẏŷÿ]/g, 'y')
        // Also normalize common ending variants
        .replace(/oth\b/g, 'ot')
        .replace(/ah\b/g, 'a');
}

// Check if text matches any variant of query
function fuzzyMatch(text, query, variants) {
    const normalizedText = normalizeForSearch(text);
    const lowerText = text.toLowerCase();
    
    // Direct match
    if (lowerText.includes(query.toLowerCase())) {
        return { matched: true, exact: true };
    }
    
    // Normalized match
    if (normalizedText.includes(normalizeForSearch(query))) {
        return { matched: true, exact: false };
    }
    
    // Variant match
    for (const variant of variants) {
        if (normalizedText.includes(variant) || lowerText.includes(variant)) {
            return { matched: true, exact: false };
        }
    }
    
    return { matched: false, exact: false };
}

async function performSearch(query) {
    if (!searchIndex) return [];
    
    const lowerQuery = query.toLowerCase();
    const variants = getSearchVariants(query);
    const results = [];
    const seenIds = new Set();
    
    // First: Title matches (highest priority)
    for (const entry of searchIndex) {
        let score = 0;
        let matchType = '';
        let snippet = '';
        
        // Check English title
        const titleMatch = fuzzyMatch(entry.title_en, query, variants);
        if (titleMatch.matched) {
            score = titleMatch.exact ? 
                (entry.title_en.toLowerCase().startsWith(lowerQuery) ? 100 : 80) : 
                70;
            matchType = 'title';
        }
        // Check Hebrew title
        else if (entry.title_he && entry.title_he.includes(query)) {
            score = 90;
            matchType = 'title_he';
        }
        
        if (score > 0) {
            results.push({ ...entry, score, matchType, snippet });
            seenIds.add(entry.id);
        }
    }
    
    // Second: Full text content matches
    if (fullTextIndex) {
        const normalizedQuery = normalizeForSearch(query);
        
        for (const entry of searchIndex) {
            if (seenIds.has(entry.id)) continue;
            
            const indexed = fullTextIndex[entry.id];
            if (!indexed) continue;
            
            // Check both raw and normalized text
            let matched = false;
            let exact = false;
            
            // Exact match in lowercase text
            if (indexed.text.includes(lowerQuery)) {
                matched = true;
                exact = true;
            }
            // Normalized match
            else if (indexed.textNormalized && indexed.textNormalized.includes(normalizedQuery)) {
                matched = true;
            }
            // Variant match
            else {
                for (const variant of variants) {
                    if (indexed.textNormalized && indexed.textNormalized.includes(variant)) {
                        matched = true;
                        break;
                    }
                }
            }
            
            if (matched) {
                // Find snippet with context
                const snippet = findSnippetFuzzy(indexed.content, query, variants);
                results.push({
                    ...entry,
                    score: exact ? 50 : 40,
                    matchType: 'content',
                    snippet
                });
                seenIds.add(entry.id);
            }
        }
    }
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    
    // Return top 10 results
    return results.slice(0, 10);
}

function findSnippet(content, query) {
    return findSnippetFuzzy(content, query, getSearchVariants(query));
}

function findSnippetFuzzy(content, query, variants) {
    if (!content || !content.length) return '';
    
    // Search through verses for a match
    for (const verse of content) {
        // Check English first
        if (verse.english) {
            const match = fuzzyMatch(verse.english, query, variants);
            if (match.matched) {
                return extractSnippetFuzzy(verse.english, query, variants);
            }
        }
        // Then Hebrew
        if (verse.hebrew && verse.hebrew.includes(query)) {
            return extractSnippetFuzzy(verse.hebrew, query, variants);
        }
        // Then transliteration
        if (verse.transliteration) {
            const match = fuzzyMatch(verse.transliteration, query, variants);
            if (match.matched) {
                return extractSnippetFuzzy(verse.transliteration, query, variants);
            }
        }
    }
    
    return '';
}

function extractSnippet(text, query) {
    return extractSnippetFuzzy(text, query, getSearchVariants(query));
}

function extractSnippetFuzzy(text, query, variants) {
    const maxLength = 120;
    const normalizedText = normalizeForSearch(text);
    const normalizedQuery = normalizeForSearch(query);
    
    // Try to find match position
    let index = normalizedText.indexOf(normalizedQuery);
    
    // Try variants if not found
    if (index === -1) {
        for (const variant of variants) {
            index = normalizedText.indexOf(variant);
            if (index !== -1) break;
        }
    }
    
    if (index === -1) return text.slice(0, maxLength) + '...';
    
    // Get context around the match
    let start = Math.max(0, index - 40);
    let end = Math.min(text.length, index + query.length + 60);
    
    let snippet = text.slice(start, end);
    
    // Add ellipsis if truncated
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
}

function renderSearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                No results for "${query}"
            </div>
        `;
        searchResults.classList.add('visible');
        return;
    }
    
    const html = results.map((result, index) => {
        const titleHtml = highlightMatch(result.title_en, query);
        const hebrewHtml = result.title_he ? `<span class="search-result-hebrew">${result.title_he}</span>` : '';
        const snippetHtml = result.snippet ? `<div class="search-result-snippet">${highlightMatch(result.snippet, query)}</div>` : '';
        const matchLabel = result.matchType === 'content' ? '<span class="search-match-type">in text</span>' : '';
        
        return `
            <div class="search-result-item" data-index="${index}" onclick="navigateToResult(searchResultsData[${index}])">
                <div class="search-result-title">
                    ${titleHtml}
                    ${hebrewHtml}
                    ${matchLabel}
                </div>
                <div class="search-result-meta">
                    ${result.category}${result.subcategory !== 'General' ? ' › ' + result.subcategory : ''}
                </div>
                ${snippetHtml}
            </div>
        `;
    }).join('');
    
    // Store results globally for onclick access
    window.searchResultsData = results;
    
    searchResults.innerHTML = html;
    searchResults.classList.add('visible');
}

function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function navigateToResult(result) {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.value = '';
    searchResults.innerHTML = '';
    searchResults.classList.remove('visible');
    
    if (result.type === 'text') {
        showText(result.id);
    }
}

// Count total texts
function countTexts() {
    if (!catalog) return 0;
    let total = 0;
    for (const cat of Object.values(catalog)) {
        for (const items of Object.values(cat)) {
            total += items.length;
        }
    }
    return total;
}

// Show home page
function showHome() {
    window.location.hash = '';
    
    const totalTexts = countTexts();
    const categories = Object.keys(catalog || {});
    
    let categoriesHtml = '';
    for (const [cat, subcats] of Object.entries(catalog || {})) {
        const count = Object.values(subcats).reduce((sum, items) => sum + items.length, 0);
        const subcatNames = Object.keys(subcats).filter(s => s !== 'General').slice(0, 3);
        
        categoriesHtml += `
            <a class="category-card" href="#" onclick="showCategory('${cat}'); return false;">
                <h3>${cat} <span class="count">(${count})</span></h3>
                ${subcatNames.length > 0 ? `
                    <div class="subcategories">
                        ${subcatNames.join(' • ')}${Object.keys(subcats).length > 3 ? ' • ...' : ''}
                    </div>
                ` : ''}
            </a>
        `;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="home-hero">
            <h1>מרכז הלימוד היהודי הקראי</h1>
            <p class="subtitle">Karaite Jewish Learning Center</p>
            <p class="description">
                A comprehensive collection of Karaite Jewish texts including the complete Tanakh,
                liturgy, halakhah, biblical commentaries, and poetry. Texts are presented in Hebrew 
                with English translation.
            </p>
        </div>
        
        <div class="home-stats">
            <div class="stat">
                <div class="stat-number">39</div>
                <div class="stat-label">Tanakh Books</div>
            </div>
            <div class="stat">
                <div class="stat-number">${totalTexts}</div>
                <div class="stat-label">Other Texts</div>
            </div>
            <div class="stat">
                <div class="stat-number">${categories.length}</div>
                <div class="stat-label">Categories</div>
            </div>
        </div>
        
        <div class="categories-grid">
            <a class="category-card tanakh-card" href="#" onclick="showTanakh(); return false;">
                <h3>תנ״ך <span class="count">Tanakh</span></h3>
                <div class="subcategories">
                    Torah • Prophets • Writings
                </div>
            </a>
            ${categoriesHtml}
        </div>
    `;
}

// Show changelog
async function showChangelog() {
    window.location.hash = 'changelog';

    let changelog = [];
    try {
        const response = await fetch('data/changelog.json');
        if (response.ok) {
            changelog = await response.json();
        }
    } catch (e) {
        console.error('Failed to load changelog:', e);
    }

    const entriesHtml = changelog.map(entry => {
        const changesHtml = entry.changes.map(change => `
            <li>${change}</li>
        `).join('');
        return `
            <div class="changelog-entry">
                <h3 class="changelog-date">${entry.date}</h3>
                <ul class="changelog-list">${changesHtml}</ul>
            </div>
        `;
    }).join('');

    document.getElementById('app').innerHTML = `
        <div class="reader-container">
            <div class="breadcrumb" style="margin-bottom: var(--space-lg);">
                <a href="#" onclick="showHome(); return false;">Home</a>
                <span>›</span>
                <span>What's New</span>
            </div>
            <h1 class="changelog-title">What's New</h1>
            <div class="changelog-content">
                ${entriesHtml}
            </div>
        </div>
    `;
}

// Show category
function showCategory(categoryName) {
    if (categoryName === 'all') {
        showAllTexts();
        return;
    }
    
    window.location.hash = `category/${encodeURIComponent(categoryName)}`;
    
    const subcats = catalog[categoryName];
    if (!subcats) {
        document.getElementById('app').innerHTML = `
            <div class="text-list-header">
                <h1>Category not found</h1>
            </div>
        `;
        return;
    }
    
    // Use collapsible list layout for Liturgy
    if (categoryName === 'Liturgy') {
        showLiturgy();
        return;
    }
    
    // Default grid layout for other categories
    let sectionsHtml = '';
    for (const [subcat, texts] of Object.entries(subcats)) {
        const textsHtml = texts.map(t => `
            <a class="text-card" href="#" onclick="showText('${t.id}'); return false;">
                ${t.title_he ? `<div class="title-he">${t.title_he}</div>` : ''}
                ${t.hasAudio ? '<span class="audio-icon" title="Has audio">♪</span>' : ''}
                <div class="title-en">${t.title_en}</div>
            </a>
        `).join('');
        
        sectionsHtml += `
            <div class="subcategory-section">
                <h2>${subcat}</h2>
                <div class="texts-grid">
                    ${textsHtml}
                </div>
            </div>
        `;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="text-list-header">
            <h1>${categoryName}</h1>
            <div class="breadcrumb">
                <a href="#" onclick="showHome(); return false;">Home</a>
                <span>›</span>
                <span>${categoryName}</span>
            </div>
        </div>
        ${sectionsHtml}
    `;
}

// Shabbat Morning Services structured data
let shabbatMorningData = null;

async function loadShabbatMorningData() {
    if (shabbatMorningData) return shabbatMorningData;
    try {
        const response = await fetch('data/shabbat-morning-services.json?v=' + Date.now());
        shabbatMorningData = await response.json();
    } catch (e) {
        shabbatMorningData = null;
    }
    return shabbatMorningData;
}

// Show Liturgy with special Shabbat Morning Services layout
async function showLiturgy() {
    const subcats = catalog['Liturgy'];
    const smsData = await loadShabbatMorningData();
    
    let sectionsHtml = '';
    
    for (const [subcat, texts] of Object.entries(subcats)) {
        // Special rendering for Shabbat Morning Services
        if (subcat === 'Shabbat Morning Services' && smsData) {
            sectionsHtml += renderShabbatMorningServices(smsData, texts);
            continue;
        }
        
        // Skip "Supplemental Readings" - it's now part of Shabbat Morning Services
        if (subcat === 'Supplemental Readings for specific Torah portions') {
            continue;
        }
        
        // Regular liturgy items
        const textsHtml = texts.map(t => `
            <a class="liturgy-item" href="#" onclick="showText('${t.id}'); return false;">
                <span class="liturgy-he">${t.title_he || ''}</span>
                <span class="audio-icon">${t.hasAudio ? '♪' : ''}</span>
                <span class="liturgy-en">${t.title_en}</span>
            </a>
        `).join('');
        
        sectionsHtml += `
            <div class="liturgy-section">
                <div class="liturgy-header" onclick="toggleLiturgySection(this)">
                    <span class="liturgy-toggle">▼</span>
                    <span class="liturgy-category">${subcat}</span>
                </div>
                <div class="liturgy-items">
                    ${textsHtml}
                </div>
            </div>
        `;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="text-list-header">
            <h1>Liturgy</h1>
            <div class="breadcrumb">
                <a href="#" onclick="showHome(); return false;">← To texts</a>
            </div>
        </div>
        <div class="liturgy-container">
            ${sectionsHtml}
        </div>
    `;
}

// Render Shabbat Morning Services with Kedushot and Torah portions
//
// DATA MODEL NOTES (see DATA_MODEL.md for full documentation):
// 
// 1. "Poems for the Weekly Torah Portion" (torahPortions):
//    - These are the PRIMARY piyyutim for each parasha (e.g., "Piyyut: Bereshit")
//    - Authored by Aaron ben Joseph, one per Torah portion
//    - Displayed organized by book of the Torah (Genesis, Exodus, etc.)
//    - Data source: shabbat-morning-services.json -> data['Poems for the Weekly Torah Portion']
//    - Text lookup: catalog['Liturgy']['Supplemental Readings for specific Torah portions']
//
// 2. Weekly Kedushot (qedushaOrder):
//    - Five rotating Kedushot used throughout the year
//    - Not tied to specific parashot
//
// Note: Some texts may be "recited on" a parasha (e.g., Vehahochma recited on Bereshit)
// but are NOT the designated piyyut for that parasha. These are separate texts that
// use the recited_on_parasha field in their JSON to indicate the association.
//
function renderShabbatMorningServices(smsData, kedushtItems) {
    const weeklyPoems = smsData.data['Poems for the Weekly Sabbath'] || [];
    const torahPortions = smsData.data['Poems for the Weekly Torah Portion'] || [];
    
    // Build Qedusha Verse section - ordered First through Fifth
    const qedushaOrder = [
        { key: 'Atta Qadosh', he: 'אַתָּה קָדוֹשׁ', en: 'Atta Qadosh', verse: 'First - Ve\'atta Qadosh', id: 'a-atta-qadosh' },
        { key: 'Essa Lamerahoq', he: 'אֶשָּׂא לְמֵרָחוֹק', en: 'Essa Lamerahoq', verse: 'Second - Goalenu', id: 'b-essa-lamerahoq' },
        { key: 'El Mistatter', he: 'אֵל מִסְתַּתֵּר', en: 'El Mistatter', verse: 'Third - Qadosh Qadosh', id: 'c-el-mistatter' },
        { key: 'Addir Venora', he: 'אַדִּיר וְנוֹרָא', en: 'Addir Venora', verse: 'Fourth - Barukh Kevod', id: 'd-adir-venora' },
        { key: 'Eḥad Elohenu', he: 'אֶחָד אֱלֹהֵֽינוּ', en: 'Eḥad Elohenu', verse: 'Fifth - Shema\' Yisrael', id: 'e-ehad-elohenu' }
    ];
    
    let qedushaHtml = '';
    for (const q of qedushaOrder) {
        qedushaHtml += `
            <a class="sms-item" href="#" onclick="showText('${q.id}'); return false;">
                <span class="sms-he">${q.he}</span>
                <span class="audio-icon">♪</span>
                <span class="sms-en">${q.en}</span>
                <span class="sms-verse">${q.verse}</span>
            </a>
        `;
    }
    
    // Build Torah Portions by book
    const torahTexts = catalog['Liturgy']['Supplemental Readings for specific Torah portions'] || [];
    const textIdMap = {};
    // Normalize apostrophes for matching - handle all types
    const normalizeApostrophe = (s) => s.replace(/[''ʻʼ`'\u2019\u02BC\u02BB\u0027]/g, "'");
    
    for (const t of torahTexts) {
        const normalized = normalizeApostrophe(t.title_en);
        textIdMap[t.title_en] = t;
        textIdMap[normalized] = t;
        // Also map by the name without the number prefix (e.g., "Ha'azinu" for "53 Ha'azinu")
        const match = normalized.match(/^\d+\s+(.+)$/);
        if (match) {
            textIdMap[match[1]] = t;
        }
    }
    
    // Helper to find text by menu item name
    const findText = (menuItem) => {
        const normalized = normalizeApostrophe(menuItem);
        // Try direct match
        if (textIdMap[menuItem]) return textIdMap[menuItem];
        if (textIdMap[normalized]) return textIdMap[normalized];
        // Try case-insensitive search
        for (const [key, val] of Object.entries(textIdMap)) {
            if (normalizeApostrophe(key).toLowerCase() === normalized.toLowerCase()) {
                return val;
            }
        }
        return null;
    };
    
    let torahHtml = '';
    for (const book of torahPortions) {
        const bookItems = book.menu_items.map(item => {
            const textInfo = findText(item.menu_item) || {};
            const textId = textInfo.id || '';
            const hasAudio = textInfo.hasAudio;
            return `
                <a class="sms-item sms-torah-item" href="#" onclick="showText('${textId}'); return false;">
                    <span class="audio-icon">${hasAudio ? '♪' : ''}</span>
                    <span class="sms-en">${item.menu_item.replace('Piyyut: ', 'Piyyut Parasha: ')}</span>
                    <span class="sms-complement">- ${item.complement}</span>
                </a>
            `;
        }).join('');
        
        torahHtml += `
            <div class="sms-book-section">
                <div class="sms-book-header" onclick="toggleSmsBook(this)">
                    <span class="sms-book-title">${book.menu_title_left}</span>
                    <span class="sms-book-right">Recited in Place of</span>
                    <span class="sms-toggle">▼</span>
                </div>
                <div class="sms-book-items">
                    ${bookItems}
                </div>
            </div>
        `;
    }
    
    return `
        <div class="liturgy-section sms-section">
            <div class="liturgy-header" onclick="toggleLiturgySection(this)">
                <span class="liturgy-toggle">▼</span>
                <span class="liturgy-category">Shabbat Morning Services</span>
            </div>
            <div class="liturgy-items sms-content">
                <h3 class="sms-heading">Kedushot for Standard Shabbat Services</h3>
                <div class="sms-qedusha">
                    <div class="sms-qedusha-header">
                        <span></span>
                        <span></span>
                        <span class="sms-header-right">Qedusha Verse</span>
                    </div>
                    ${qedushaHtml}
                </div>
                
                <h3 class="sms-heading">Poems for the Weekly Torah Portion</h3>
                <div class="sms-torah">
                    ${torahHtml}
                </div>
            </div>
        </div>
    `;
}

function toggleSmsBook(header) {
    const section = header.parentElement;
    const items = section.querySelector('.sms-book-items');
    const toggle = header.querySelector('.sms-toggle');
    
    if (items.style.display === 'none') {
        items.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        items.style.display = 'none';
        toggle.textContent = '▶';
    }
}

// Toggle liturgy section expand/collapse
function toggleLiturgySection(header) {
    const section = header.parentElement;
    const items = section.querySelector('.liturgy-items');
    const toggle = header.querySelector('.liturgy-toggle');
    
    if (items.style.display === 'none') {
        items.style.display = 'block';
        toggle.textContent = '▼';
    } else {
        items.style.display = 'none';
        toggle.textContent = '▶';
    }
}

// Show all texts
function showAllTexts() {
    window.location.hash = 'category/all';
    
    // Group texts by category (excluding Tanakh)
    const textsByCategory = {};
    let totalCount = 0;
    
    for (const [cat, subcats] of Object.entries(catalog)) {
        if (cat === 'Tanakh') continue; // Exclude Tanakh
        
        textsByCategory[cat] = [];
        for (const texts of Object.values(subcats)) {
            for (const t of texts) {
                textsByCategory[cat].push({ ...t, category: cat });
                totalCount++;
            }
        }
        // Sort texts within category by transliteration (title_en)
        textsByCategory[cat].sort((a, b) => a.title_en.localeCompare(b.title_en));
    }
    
    // Store for sorting
    window.allTextsByCategory = textsByCategory;
    
    // Build HTML grouped by category
    const categoryOrder = ['Liturgy', 'Halakhah', 'Commentary', 'Exhortatory', 'Polemics', 'Other'];
    const categoriesHtml = categoryOrder
        .filter(cat => textsByCategory[cat] && textsByCategory[cat].length > 0)
        .map(cat => buildCategoryTable(cat, textsByCategory[cat]))
        .join('');
    
    document.getElementById('app').innerHTML = `
        <div class="text-list-header">
            <h1>All Texts (${totalCount})</h1>
            <div class="breadcrumb">
                <a href="#" onclick="showHome(); return false;">Home</a>
                <span>›</span>
                <span>All Texts</span>
            </div>
        </div>
        ${categoriesHtml}
    `;
}

function buildCategoryTable(cat, texts) {
    const rowsHtml = texts.map(t => `
        <tr class="text-row" onclick="showText('${t.id}')">
            <td class="col-hebrew">${t.title_he || ''}</td>
            <td class="col-title">${t.title_en}</td>
            <td class="col-author">${t.author_en || ''}</td>
        </tr>
    `).join('');
    
    return `
        <div class="all-texts-category" id="category-${cat.toLowerCase().replace(/\s+/g, '-')}">
            <h2 class="category-heading">${cat} <span class="category-count">(${texts.length})</span></h2>
            <table class="texts-table">
                <thead>
                    <tr>
                        <th class="col-hebrew sortable" onclick="sortCategoryTable('${cat}', 'title_he')">Hebrew <span class="sort-icon">↕</span></th>
                        <th class="col-title sortable" onclick="sortCategoryTable('${cat}', 'title_en')">Title <span class="sort-icon">↕</span></th>
                        <th class="col-author sortable" onclick="sortCategoryTable('${cat}', 'author_en')">Author <span class="sort-icon">↕</span></th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>
        </div>
    `;
}

let sortDirections = {};
function sortCategoryTable(cat, field) {
    const key = `${cat}-${field}`;
    sortDirections[key] = sortDirections[key] === 'asc' ? 'desc' : 'asc';
    const dir = sortDirections[key];
    
    const texts = window.allTextsByCategory[cat];
    texts.sort((a, b) => {
        const valA = (a[field] || '').toLowerCase();
        const valB = (b[field] || '').toLowerCase();
        if (dir === 'asc') {
            return valA.localeCompare(valB);
        } else {
            return valB.localeCompare(valA);
        }
    });
    
    // Re-render just this category's table body
    const container = document.getElementById(`category-${cat.toLowerCase().replace(/\s+/g, '-')}`);
    if (container) {
        const tbody = container.querySelector('tbody');
        tbody.innerHTML = texts.map(t => `
            <tr class="text-row" onclick="showText('${t.id}')">
                <td class="col-hebrew">${t.title_he || ''}</td>
                <td class="col-title">${t.title_en}</td>
                <td class="col-author">${t.author_en || ''}</td>
            </tr>
        `).join('');
    }
}

// Show text
async function showText(textId) {
    window.location.hash = `text/${textId}`;
    
    document.getElementById('app').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
        </div>
    `;
    
    try {
        const response = await fetch(`data/texts/${textId}.json`);
        if (!response.ok) throw new Error('Text not found');
        currentText = await response.json();
        renderText();
    } catch (error) {
        console.error('Failed to load text:', error);
        document.getElementById('app').innerHTML = `
            <div class="text-list-header">
                <h1>Text not found</h1>
                <div class="breadcrumb">
                    <a href="#" onclick="showHome(); return false;">← Back to Home</a>
                </div>
            </div>
        `;
    }
}

// Render text
function renderText() {
    if (!currentText) return;
    
    // Check for sections (new format) or legacy introduction
    const hasSections = currentText.sections;
    const hasIntro = hasSections ? currentText.sections.intro : currentText.introduction;
    const hasAppendices = hasSections && currentText.sections.appendices;
    
    // Get current content based on tab
    let currentContent = currentText.content;
    if (hasSections) {
        if (currentTab === 'intro' && currentText.sections.intro) {
            currentContent = currentText.sections.intro.content;
        } else if (currentTab === 'appendices' && currentText.sections.appendices) {
            currentContent = currentText.sections.appendices.content;
        } else if (currentText.sections.text) {
            currentContent = currentText.sections.text.content;
        }
    }
    
    const hasArabic = currentContent.some(v => v.arabic);
    const hasAudio = currentText.audio;
    
    // Build tabs/sections
    const hasToc = currentText.toc && currentText.toc.length > 0;
    let tabsHtml = '';
    if (hasSections) {
        if (hasToc) {
            tabsHtml += `<button class="tab-btn ${currentTab === 'toc' ? 'active' : ''}" onclick="switchTab('toc')">Contents</button>`;
        }
        if (currentText.sections.intro) {
            tabsHtml += `<button class="tab-btn ${currentTab === 'intro' ? 'active' : ''}" onclick="switchTab('intro')">Introduction</button>`;
        }
        tabsHtml += `<button class="tab-btn ${currentTab === 'text' ? 'active' : ''}" onclick="switchTab('text')">Text</button>`;
        if (currentText.sections.appendices) {
            tabsHtml += `<button class="tab-btn ${currentTab === 'appendices' ? 'active' : ''}" onclick="switchTab('appendices')">Appendices</button>`;
        }
    } else {
        tabsHtml = `<button class="tab-btn ${currentTab === 'text' ? 'active' : ''}" onclick="switchTab('text')">Text</button>`;
        if (hasIntro) {
            tabsHtml += `<button class="tab-btn ${currentTab === 'intro' ? 'active' : ''}" onclick="switchTab('intro')">Introduction</button>`;
        }
        if (currentText.glossary && currentText.glossary.length > 0) {
            tabsHtml += `<button class="tab-btn ${currentTab === 'glossary' ? 'active' : ''}" onclick="switchTab('glossary')">Glossary</button>`;
        }
    }
    
    // Build controls
    const hasComments = currentContent.some(v => v.comments);
    const commentsModeSelect = hasComments ? `
        <select class="comments-mode-select" onchange="setCommentsMode(this.value)" title="KJLC Notes display mode">
            <option value="inline-english" ${commentsMode === 'inline-english' ? 'selected' : ''}>KJLC Notes: Under English</option>
            <option value="inline-full" ${commentsMode === 'inline-full' ? 'selected' : ''}>KJLC Notes: Full Width</option>
            <option value="panel" ${commentsMode === 'panel' ? 'selected' : ''}>KJLC Notes: Side Panel</option>
        </select>
    ` : '';
    const controlsHtml = `
        <button class="toggle-btn ${showHebrew ? 'active' : ''}" onclick="toggleColumn('hebrew')">Hebrew</button>
        <button class="toggle-btn ${showTransliteration ? 'active' : ''}" onclick="toggleColumn('transliteration')">Transliteration</button>
        <button class="toggle-btn ${showEnglish ? 'active' : ''}" onclick="toggleColumn('english')">English</button>
        ${hasArabic ? `<button class="toggle-btn ${showArabic ? 'active' : ''}" onclick="toggleColumn('arabic')">Arabic</button>` : ''}
        ${hasComments ? `<button class="toggle-btn ${showComments ? 'active' : ''}" onclick="toggleColumn('comments')">KJLC Notes</button>` : ''}
        ${commentsModeSelect}
    `;
    
    // Build audio player
    let audioHtml = '';
    if (hasAudio && currentTab === 'text') {
        const hasMultipleTracks = currentText.audioTracks && currentText.audioTracks.length > 1;
        
        let trackSelectorHtml = '';
        if (hasMultipleTracks) {
            const options = currentText.audioTracks.map((track, i) => 
                `<option value="${i}">${track.label}</option>`
            ).join('');
            trackSelectorHtml = `
                <select class="audio-track-select" onchange="switchAudioTrack(this.value)" title="Select recording">
                    ${options}
                </select>
            `;
        }
        
        audioHtml = `
            <div class="audio-player">
                <button class="audio-btn play-btn" onclick="toggleAudio()" title="Play/Pause">
                    <svg class="icon-play" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg class="icon-pause" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                </button>
                <div class="audio-progress-container" onclick="seekAudio(event)">
                    <div class="audio-progress-bar">
                        <div class="audio-progress" id="audioProgress"></div>
                    </div>
                </div>
                <span class="audio-time" id="audioTime">0:00 / 0:00</span>
                <button class="audio-btn click-to-play-btn ${clickToPlayMode ? 'active' : ''}" onclick="toggleClickToPlayMode()" title="Click-to-play mode: click verse icons to play">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                </button>
                ${trackSelectorHtml}
            </div>
        `;
    }
    
    // Build content
    let contentHtml = '';
    
    // TOC tab
    if (currentTab === 'toc' && hasToc) {
        contentHtml = `
            <div class="table-of-contents">
                ${currentText.toc.map(section => `
                    <div class="toc-section">
                        <h3 class="toc-section-title">${section.title}</h3>
                        <ul class="toc-list">
                            ${section.items.map(item => `
                                <li class="toc-item">
                                    <a href="#" onclick="navigateToSection('${section.section}', '${item.section_id}', ${item.index}); return false;">
                                        ${item.title}
                                    </a>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }
    // Legacy intro format
    else if (currentTab === 'intro' && !hasSections && hasIntro) {
        contentHtml = `
            <div class="introduction">
                ${formatIntroduction(currentText.introduction)}
            </div>
        `;
    }
    // Glossary tab
    else if (currentTab === 'glossary' && currentText.glossary && currentText.glossary.length > 0) {
        contentHtml = `
            <div class="glossary">
                <h2>Glossary of Terms</h2>
                <div class="glossary-list">
                    ${currentText.glossary.map(term => `
                        <div class="glossary-entry">
                            <div class="glossary-term">
                                <span class="glossary-hebrew">${term.hebrew}</span>
                                ${term.transliteration ? `<span class="glossary-translit">(${term.transliteration})</span>` : ''}
                            </div>
                            <div class="glossary-definition">${term.definition}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (currentTab !== 'toc') {
        const verses = currentContent.map((v, i) => {
            const showRight = showTransliteration || showEnglish;
            const singleColumn = !showHebrew || !showRight;
            const hasTiming = v.timing;
            // Check if "hebrew" field actually contains English text (data issue in some files)
            const hebrewHasEnglish = v.hebrew && /[a-zA-Z]{3,}/.test(v.hebrew);
            // Check if "english" field is just a line number (1-4 digits only)
            const hasLineNumber = v.english && /^\d{1,4}$/.test(v.english.trim());
            const isEnglishOnly = v.english_only === true || (!v.hebrew && v.english && !hasLineNumber);
            const isHebrewOnly = v.hebrew && !v.english && !v.transliteration && !hebrewHasEnglish;
            const isMixedEnglish = hebrewHasEnglish && !v.english;  // English in hebrew field
            // Check if Hebrew and English are identical (like "1864") - should be centered
            const isDuplicateContent = v.hebrew && v.english && v.hebrew.trim() === v.english.trim();
            // Check if this is a Hebrew footnote (starts with [number])
            const isHebrewFootnote = v.hebrew && /^\[\d+\]/.test(v.hebrew) && !hebrewHasEnglish;
            
            const hasComment = showComments && v.comments;
            // Apply term highlighting for categories with structured footnotes (incipit — definition format)
            const shouldHighlightTerms = currentText.category === 'Liturgy' || currentText.category === 'Comments' || currentText.category === 'Commentary' || currentText.category === 'Halakhah';
            const commentHtml = hasComment ? formatComments(v.comments, shouldHighlightTerms) : '';
            const showCommentColumn = commentsMode === 'panel' && showComments;
            // Detect if comments are primarily Hebrew (RTL) - check for Hebrew chars vs Latin chars
            const commentsAreHebrew = hasComment && isHebrewText(v.comments);
            
            return `
                <div class="verse ${singleColumn ? 'single-column' : ''} ${hasTiming ? 'has-timing' : ''} ${isEnglishOnly ? 'english-only' : ''} ${isHebrewOnly ? 'hebrew-only' : ''} ${isMixedEnglish ? 'mixed-english' : ''} ${isHebrewFootnote ? 'hebrew-footnote' : ''} ${hasLineNumber ? 'has-line-number' : ''} ${isDuplicateContent ? 'duplicate-content' : ''} ${showCommentColumn ? 'with-comment-col' : ''}" 
                     data-index="${i}" 
                     ${v.section_id ? `id="${v.section_id}"` : ''}
                     ${hasTiming ? `data-start="${v.timing.start}" data-end="${v.timing.end}"` : ''}>
                    ${hasTiming ? `<span class="verse-play-icon" style="${clickToPlayMode ? '' : 'display:none'}" onclick="seekToVerse(${i}); event.stopPropagation();" title="Play from here">♪</span>` : ''}
                    ${showHebrew && v.hebrew && !isMixedEnglish ? `
                        <div class="verse-hebrew">${formatText(v.hebrew)}</div>
                    ` : ''}
                    ${isMixedEnglish && v.hebrew ? `
                        <div class="verse-mixed-content">${formatText(v.hebrew)}</div>
                    ` : ''}
                    ${showRight || isEnglishOnly ? `
                        <div class="verse-right">
                            ${showTransliteration && v.transliteration ? `
                                <div class="verse-transliteration">${formatText(v.transliteration)}</div>
                            ` : ''}
                            ${(showEnglish || isEnglishOnly) && v.english ? `
                                <div class="verse-english">${formatText(v.english)}</div>
                            ` : ''}
                            ${hasArabic && showArabic && v.arabic ? `
                                <div class="verse-arabic">${formatText(v.arabic)}</div>
                            ` : ''}
                            ${hasComment && commentsMode === 'inline-english' ? `
                                <div class="verse-comments ${commentsAreHebrew ? 'rtl-comments' : ''}">${commentHtml}</div>
                            ` : ''}
                        </div>
                    ` : ''}
                    ${hasComment && commentsMode === 'inline-full' ? `
                        <div class="verse-comments verse-comments-full ${commentsAreHebrew ? 'rtl-comments' : ''}">${commentHtml}</div>
                    ` : ''}
                    ${showCommentColumn ? `
                        <div class="verse-comment-col ${commentsAreHebrew ? 'rtl-comments' : ''}">${hasComment ? commentHtml : ''}</div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // For panel mode, create a two-pane layout with positioned notes
        // In panel mode, remove the inline comments from verses
        if (commentsMode === 'panel' && showComments) {
            // Re-render verses without inline comments for panel mode
            const versesNoInline = currentContent.map((v, i) => {
                const showRight = showTransliteration || showEnglish;
                const singleColumn = !showHebrew || !showRight;
                const hasTiming = v.timing;
                const hebrewHasEnglish = v.hebrew && /[a-zA-Z]{3,}/.test(v.hebrew);
                const hasLineNumber = v.english && /^\d{1,4}$/.test(v.english.trim());
                const isEnglishOnly = v.english_only === true || (!v.hebrew && v.english && !hasLineNumber);
                const isHebrewOnly = v.hebrew && !v.english && !v.transliteration && !hebrewHasEnglish;
                const isMixedEnglish = hebrewHasEnglish && !v.english;
                const isHebrewFootnote = v.hebrew && /^\[\d+\]/.test(v.hebrew) && !hebrewHasEnglish;
                const isDuplicateContent = v.hebrew && v.english && v.hebrew.trim() === v.english.trim();
                
                return `
                    <div class="verse ${singleColumn ? 'single-column' : ''} ${hasTiming ? 'has-timing' : ''} ${isEnglishOnly ? 'english-only' : ''} ${isHebrewOnly ? 'hebrew-only' : ''} ${isMixedEnglish ? 'mixed-english' : ''} ${isHebrewFootnote ? 'hebrew-footnote' : ''} ${hasLineNumber ? 'has-line-number' : ''} ${isDuplicateContent ? 'duplicate-content' : ''}" 
                         data-index="${i}" 
                         ${v.section_id ? `id="${v.section_id}"` : ''}
                         ${hasTiming ? `data-start="${v.timing.start}" data-end="${v.timing.end}"` : ''}>
                        ${hasTiming ? `<span class="verse-play-icon" style="${clickToPlayMode ? '' : 'display:none'}" onclick="seekToVerse(${i}); event.stopPropagation();" title="Play from here">♪</span>` : ''}
                        ${showHebrew && v.hebrew && !isMixedEnglish ? `
                            <div class="verse-hebrew">${formatText(v.hebrew)}</div>
                        ` : ''}
                        ${isMixedEnglish && v.hebrew ? `
                            <div class="verse-mixed-content">${formatText(v.hebrew)}</div>
                        ` : ''}
                        ${showRight || isEnglishOnly ? `
                            <div class="verse-right">
                                ${showTransliteration && v.transliteration ? `
                                    <div class="verse-transliteration">${formatText(v.transliteration)}</div>
                                ` : ''}
                                ${(showEnglish || isEnglishOnly) && v.english ? `
                                    <div class="verse-english">${formatText(v.english)}</div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
            
            contentHtml = `
                <div class="text-with-notes-panel">
                    <div class="text-content">${versesNoInline}</div>
                    <div class="sticky-notes-panel">
                        <div class="sticky-notes-inner"></div>
                    </div>
                </div>
            `;
        } else {
            contentHtml = `<div class="text-content">${verses}</div>`;
        }
    }
    
    const isPiyyutParasha = currentText.category === 'Liturgy' && catalog?.Liturgy?.['Supplemental Readings for specific Torah portions']?.some(t => t.id === currentText.id);
    const displayTitle = isPiyyutParasha ? `Piyyut Parasha: ${currentText.title_en}` : currentText.title_en;
    
    document.getElementById('app').innerHTML = `
        <div class="reader-container">
            <div class="reader-sticky">
                <div class="breadcrumb">
                    <a href="#" onclick="showHome(); return false;">Home</a>
                    <span>›</span>
                    <a href="#" onclick="showCategory('${currentText.category}'); return false;">${currentText.category}</a>
                    <span>›</span>
                    <span>${displayTitle}</span>
                </div>
                
                <div class="reader-header">
                    ${currentText.title_he ? `<h1 class="title-he">${currentText.title_he}</h1>` : ''}
                    <h2 class="title-en">${displayTitle}</h2>
                </div>
                
                <div class="reader-toolbar">
                    <div class="reader-tabs">
                        ${tabsHtml}
                    </div>
                    <div class="reader-controls">
                        ${controlsHtml}
                    </div>
                </div>
            </div>
            
            ${hasAudio && currentTab === 'text' ? audioHtml : ''}
            
            ${contentHtml}
        </div>
    `;
    
    // Initialize audio player if available
    if (hasAudio && currentTab === 'text') {
        initAudioPlayer();
    }
    
    // Initialize sticky notes tracking if in panel mode
    if (commentsMode === 'panel' && showComments) {
        initStickyNotesTracking();
    }
}

// Format comments/footnotes - keeps [n] as styled inline number instead of superscript
// boldTerms: if true, highlights the term being defined (for Liturgy/Commentary)
function formatComments(text, boldTerms = false) {
    if (!text) return '';
    
    // Escape HTML first
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Only apply term highlighting for Liturgy and Commentary (poems, Torah commentary)
    // Books (Halakhah, Polemics, etc.) use scholarly footnotes that shouldn't be bolded
    if (boldTerms) {
        // Highlight term being defined before em-dash (—) for each numbered footnote
        // Pattern: "¹ term (arabic) — definition" or "1 term — definition"
        // Handle superscript numbers (¹²³⁴⁵⁶⁷⁸⁹⁰) and regular numbers at start of footnotes
        // Wrap both the number and the term in styled spans
        text = text.replace(/^(\d+)\s+([^—\n]+)\s*—/gm, '<span class="comment-num">$1</span> <span class="comment-term">$2</span> —');
        text = text.replace(/([¹²³⁴⁵⁶⁷⁸⁹⁰]+)\s+([^—\n]+)\s*—/gm, '<span class="comment-num">$1</span> <span class="comment-term">$2</span> —');
        
        // Also highlight term before period or colon if no em-dash (fallback for simpler comments)
        // Only apply if no em-dash in text and no comment-term already added
        if (!text.includes('—') && !text.includes('comment-term')) {
            text = text.replace(/^([^.:\n]+)([.:])/, '<span class="comment-term">$1</span>$2');
        }
    }
    
    // Format footnote numbers [n] as styled inline numbers at start of each note
    // For RTL Hebrew, we want: number on right, period at end (left)
    text = text.replace(/\[(\d+)\]\s*/g, '<span class="comment-num">$1</span> ');
    
    // Handle multiple footnotes separated by | 
    text = text.replace(/\s*\|\s*/g, '<br><br>');
    
    // Make biblical citations clickable (reuse the same logic)
    // Convert double parentheses to single
    text = text.replace(/\(\(([^)]+)\)\)/g, '($1)');
    
    // Fix malformed parentheses
    text = text.replace(/\(([^()]+)\(/g, '($1)');
    text = text.replace(/\)([^()]+)\)/g, '($1)');
    
    // Hebrew citations
    text = text.replace(
        /\(([א-ת][א-תְֱֲֳִֵֶַָֹֻּׁׂ\s״׳]*)\s+([א-ת״׳]+)[\s׃:]+([א-ת״׳]+)\)/g,
        (match, book, chapter, verse) => {
            const bookId = getHebrewBookId(book.trim());
            const chapterNum = hebrewToNumber(chapter);
            const verseNum = hebrewToNumber(verse);
            if (bookId && chapterNum && verseNum) {
                return `<a href="#tanakh/${bookId}/${chapterNum}" class="citation-link bible-ref" onclick="showVersePopup('${bookId}', ${chapterNum}, ${verseNum}); return false;">${match}</a>`;
            }
            return `<span class="bible-ref">${match}</span>`;
        }
    );
    
    return text;
}

// Format text with markers
// Check if text is primarily Hebrew (more Hebrew chars than Latin)
function isHebrewText(text) {
    if (!text) return false;
    const hebrewChars = (text.match(/[\u0590-\u05FF]/g) || []).length;
    const latinChars = (text.match(/[a-zA-Z]/g) || []).length;
    return hebrewChars > latinChars;
}

function formatText(text, makeCitationsLinks = true) {
    if (!text) return '';
    
    // Escape HTML first
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Bold: **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="fmt-bold">$1</strong>');
    
    // Italics: _text_
    text = text.replace(/(?<![a-zA-Z])_([^_]+)_(?![a-zA-Z])/g, '<em class="fmt-italic">$1</em>');
    
    // Biblical quotes: {{bible:text}}
    text = text.replace(/\{\{bible:([^}]+)\}\}/g, '<span class="fmt-bible">$1</span>');
    
    // Headers: {{header:text}}
    text = text.replace(/\{\{header:([^}]+)\}\}/g, '<div class="fmt-header">$1</div>');
    
    // Quotes: {{quote:text}}
    text = text.replace(/\{\{quote:([^}]+)\}\}/g, '<blockquote>$1</blockquote>');
    
    // Footnote references: [n] - wrap in RTL-aware span for proper positioning in Hebrew text
    text = text.replace(/\[(\d+)\]/g, '<sup class="footnote-num">$1</sup>');
    
    // Footnote markers: {{fn:N}} - convert to styled superscript with data attribute
    text = text.replace(/\{\{fn:(\d+)\}\}/g, '<sup class="fn-marker" data-fn="$1">$1</sup>');
    
    // Unicode superscript numbers (¹²³⁴⁵⁶⁷⁸⁹⁰) - style with theme color
    text = text.replace(/([¹²³⁴⁵⁶⁷⁸⁹⁰]+)/g, '<span class="footnote-marker">$1</span>');
    
    // Make biblical citations clickable
    if (makeCitationsLinks) {
        // First, convert double parentheses to single: ((text)) -> (text)
        text = text.replace(/\(\(([^)]+)\)\)/g, '($1)');
        
        // Fix malformed parentheses: (text( -> (text) and )text) -> (text)
        text = text.replace(/\(([^()]+)\(/g, '($1)');
        text = text.replace(/\)([^()]+)\)/g, '($1)');
        
        // English citations
        text = text.replace(
            /\b(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|I+\s*Samuel|I+\s*Kings|Isaiah|Jeremiah|Ezekiel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Psalms?|Proverbs?|Job|Song\s*of\s*Songs?|Ruth|Lamentations|Ecclesiastes|Esther|Daniel|Ezra|Nehemiah|I+\s*Chronicles|Gen|Ex|Exod|Lev|Num|Deut|Josh|Judg|Isa|Jer|Ezek|Ps|Prov)\.?\s*(\d+)[:\.](\d+)(-\d+)?/gi,
            (match, book, chapter, verse) => {
                const bookId = getBookId(book);
                if (bookId) {
                    return `<a href="#tanakh/${bookId}/${chapter}" class="citation-link" onclick="showVersePopup('${bookId}', ${chapter}, ${verse}); return false;">${match}</a>`;
                }
                return match;
            }
        );
        
        // Hebrew citations with Hebrew book names: (תהלים קמ:יד) or (ישעיה מז:ד) etc.
        // Match format: (BookName Chapter:Verse) where chapter/verse use Hebrew letters or numbers
        // Note: Also matches שְׁמוּאֵל א, דִּבְרֵי הַיָּמִים א etc with nikkud
        text = text.replace(
            /\(([א-ת][א-תְֱֲֳִֵֶַָֹֻּׁׂ\s״׳]*)\s+([א-ת״׳]+)[\s׃:]+([א-ת״׳]+)\)/g,
            (match, book, chapter, verse) => {
                const bookId = getHebrewBookId(book.trim());
                const chapterNum = hebrewToNumber(chapter);
                const verseNum = hebrewToNumber(verse);
                if (bookId && chapterNum && verseNum) {
                    return `<a href="#tanakh/${bookId}/${chapterNum}" class="citation-link bible-ref" onclick="showVersePopup('${bookId}', ${chapterNum}, ${verseNum}); return false;">${match}</a>`;
                }
                return `<span class="bible-ref">${match}</span>`;
            }
        );
        
        // Hebrew citations with format like (שמות טו, ב) - comma separator
        text = text.replace(
            /\((בראשית|שמות|ויקרא|במדבר|דברים|יהושע|שופטים|שמואל א|שמואל ב|מלכים א|מלכים ב|ישעיה|ישעיהו|ירמיה|ירמיהו|יחזקאל|הושע|יואל|עמוס|עובדיה|יונה|מיכה|נחום|חבקוק|צפניה|חגי|זכריה|מלאכי|תהלים|תהילים|משלי|איוב|שיר השירים|רות|איכה|קהלת|אסתר|דניאל|עזרא|נחמיה|דברי הימים א|דברי הימים ב)\s+([א-ת״׳]+),\s*([א-ת״׳]+)\)/g,
            (match, book, chapter, verse) => {
                const bookId = getHebrewBookId(book.trim());
                const chapterNum = hebrewToNumber(chapter);
                const verseNum = hebrewToNumber(verse);
                if (bookId && chapterNum && verseNum) {
                    return `<a href="#tanakh/${bookId}/${chapterNum}" class="citation-link bible-ref" onclick="showVersePopup('${bookId}', ${chapterNum}, ${verseNum}); return false;">${match}</a>`;
                }
                return `<span class="bible-ref">${match}</span>`;
            }
        );
    }
    
    return text;
}

// Convert Hebrew numerals to numbers
function hebrewToNumber(hebrewNum) {
    const values = {
        'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
        'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
        'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90,
        'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400
    };
    
    let total = 0;
    const cleaned = hebrewNum.replace(/[״׳]/g, '');
    for (const char of cleaned) {
        if (values[char]) {
            total += values[char];
        }
    }
    return total || null;
}

// Get book ID from Hebrew book name
function getHebrewBookId(hebrewName) {
    // Strip nikkud (vowel points) for matching
    const stripNikkud = (str) => str.replace(/[\u0591-\u05C7]/g, '').trim();
    const stripped = stripNikkud(hebrewName);
    
    const map = {
        'בראשית': 'genesis',
        'שמות': 'exodus',
        'ויקרא': 'leviticus',
        'במדבר': 'numbers',
        'דברים': 'deuteronomy',
        'יהושע': 'joshua',
        'שופטים': 'judges',
        'שמואל א': 'i-samuel',
        'שמואל ב': 'ii-samuel',
        'מלכים א': 'i-kings',
        'מלכים ב': 'ii-kings',
        'ישעיה': 'isaiah',
        'ישעיהו': 'isaiah',
        'ירמיה': 'jeremiah',
        'ירמיהו': 'jeremiah',
        'יחזקאל': 'ezekiel',
        'הושע': 'hosea',
        'יואל': 'joel',
        'עמוס': 'amos',
        'עובדיה': 'obadiah',
        'יונה': 'jonah',
        'מיכה': 'micah',
        'נחום': 'nahum',
        'חבקוק': 'habakkuk',
        'צפניה': 'zephaniah',
        'חגי': 'haggai',
        'זכריה': 'zechariah',
        'מלאכי': 'malachi',
        'תהלים': 'psalms',
        'תהילים': 'psalms',
        'משלי': 'proverbs',
        'איוב': 'job',
        'שיר השירים': 'song-of-songs',
        'רות': 'ruth',
        'איכה': 'lamentations',
        'קהלת': 'ecclesiastes',
        'אסתר': 'esther',
        'דניאל': 'daniel',
        'עזרא': 'ezra',
        'נחמיה': 'nehemiah',
        'דברי הימים א': 'i-chronicles',
        'דברי הימים ב': 'ii-chronicles'
    };
    
    // Try direct match first
    if (map[hebrewName]) return map[hebrewName];
    
    // Try stripped match
    if (map[stripped]) return map[stripped];
    
    // Try matching against stripped keys
    for (const [key, value] of Object.entries(map)) {
        if (stripNikkud(key) === stripped) {
            return value;
        }
    }
    
    return null;
}

// Format introduction
function formatIntroduction(text) {
    if (!text) return '';
    
    // Split into paragraphs
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map(p => `<p>${formatText(p.trim())}</p>`).join('');
}

// Toggle column visibility
function toggleColumn(column) {
    switch(column) {
        case 'hebrew':
            showHebrew = !showHebrew;
            break;
        case 'transliteration':
            showTransliteration = !showTransliteration;
            break;
        case 'english':
            showEnglish = !showEnglish;
            break;
        case 'arabic':
            showArabic = !showArabic;
            break;
        case 'comments':
            showComments = !showComments;
            break;
    }
    renderText();
}

// Set comments display mode
function setCommentsMode(mode) {
    commentsMode = mode;
    localStorage.setItem('commentsMode', mode);
    renderText();
}

// Toggle comment expand/collapse in side panel
function toggleCommentExpand(btn) {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('.toggle-icon');
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        icon.textContent = '▼';
    } else {
        content.classList.add('collapsed');
        icon.textContent = '▶';
    }
}

// Position notes in side panel aligned with their footnote markers
function initStickyNotesTracking() {
    const panel = document.querySelector('.sticky-notes-panel');
    if (!panel) return;
    
    const contentArea = document.querySelector('.text-content');
    if (!contentArea) return;
    
    // Find all footnote markers and position their notes
    const markers = document.querySelectorAll('.fn-marker[data-fn]');
    const notesInner = panel.querySelector('.sticky-notes-inner');
    if (!notesInner) return;
    
    // Clear existing positioned notes
    notesInner.innerHTML = '';
    notesInner.style.position = 'relative';
    
    // Track which footnotes we've already added (avoid duplicates)
    const addedFns = new Set();
    
    markers.forEach(marker => {
        const fnNum = marker.dataset.fn;
        
        // Skip if we've already added this footnote number
        if (addedFns.has(fnNum)) return;
        addedFns.add(fnNum);
        
        const verse = marker.closest('.verse');
        if (!verse) return;
        
        const verseIndex = verse.dataset.index;
        const verseData = currentText.content[verseIndex];
        if (!verseData || !verseData.comments) return;
        
        // Get marker position relative to content area
        const markerTop = marker.offsetTop + verse.offsetTop;
        
        // Format the note
        const shouldHighlightTerms = currentText.category === 'Liturgy' || currentText.category === 'Comments' || currentText.category === 'Commentary' || currentText.category === 'Halakhah';
        const formatted = formatComments(verseData.comments, shouldHighlightTerms);
        
        // Extract the incipit (the Hebrew word being commented on) for collapsed preview
        // Pattern: "1 word — definition" - extract "word"
        const incipitMatch = verseData.comments.match(/^\d+\s+([^\s—]+)/);
        const incipit = incipitMatch ? incipitMatch[1] : '';
        
        // Create note element
        const note = document.createElement('div');
        note.className = 'positioned-note collapsed';
        note.style.top = `${markerTop}px`;
        note.innerHTML = `
            <div class="note-toggle" onclick="toggleNote(this)">
                <span class="toggle-icon">▶</span>
                <span class="note-num">${fnNum}</span>
                <span class="note-incipit">${incipit}</span>
            </div>
            <div class="note-content">${formatted}</div>
        `;
        
        notesInner.appendChild(note);
    });
}

function toggleNote(toggle) {
    const note = toggle.closest('.positioned-note');
    const icon = toggle.querySelector('.toggle-icon');
    if (note.classList.contains('collapsed')) {
        note.classList.remove('collapsed');
        icon.textContent = '▼';
    } else {
        note.classList.add('collapsed');
        icon.textContent = '▶';
    }
}

// Show footnote in fixed side panel
function showFootnotePopover(marker, fnNum) {
    // Find the verse containing this marker
    const verse = marker.closest('.verse');
    if (!verse) return;
    
    // Get the comments for this verse
    const verseIndex = parseInt(verse.dataset.index);
    if (!currentText || !currentText.content[verseIndex]) return;
    
    const comments = currentText.content[verseIndex].comments;
    if (!comments) return;
    
    // Format the content
    const shouldHighlightTerms = currentText.category === 'Liturgy' || currentText.category === 'Comments' || currentText.category === 'Commentary' || currentText.category === 'Halakhah';
    const formattedContent = formatComments(comments, shouldHighlightTerms);
    
    // Get or create the fixed side panel
    let panel = document.querySelector('.footnote-side-panel');
    if (!panel) {
        panel = document.createElement('div');
        panel.className = 'footnote-side-panel';
        document.body.appendChild(panel);
    }
    
    // Get marker position to align panel content
    const markerRect = marker.getBoundingClientRect();
    const panelTop = markerRect.top + window.scrollY - 20;
    
    panel.innerHTML = `
        <button class="panel-close" onclick="closeFootnotePanel()">×</button>
        <div class="panel-header">Note ${fnNum}</div>
        <div class="panel-content">${formattedContent}</div>
    `;
    
    panel.style.top = `${Math.max(100, panelTop)}px`;
    panel.classList.add('open');
    
    // Highlight the active marker
    document.querySelectorAll('.fn-marker.active').forEach(m => m.classList.remove('active'));
    marker.classList.add('active');
}

function closeFootnotePanel() {
    const panel = document.querySelector('.footnote-side-panel');
    if (panel) {
        panel.classList.remove('open');
    }
    document.querySelectorAll('.fn-marker.active').forEach(m => m.classList.remove('active'));
}

// Navigate to a specific section from TOC
function navigateToSection(tab, sectionId, index) {
    currentTab = tab;
    renderText();
    
    // Wait for render then scroll to the section
    setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Highlight briefly
            element.classList.add('highlight-section');
            setTimeout(() => element.classList.remove('highlight-section'), 2000);
        }
    }, 100);
}



// Switch tab
function switchTab(tab) {
    currentTab = tab;
    renderText();
}

// Global for Arabic toggle
let showArabic = true;

// Audio functions
function initAudioPlayer() {
    if (!currentText || !currentText.audio) return;
    
    // Clean up previous player
    if (audioPlayer) {
        audioPlayer.pause();
        cancelAnimationFrame(animationFrameId);
    }
    
    // Get the start time of the first verse (for texts that start mid-audio like weekly kedushot)
    const firstVerseStart = currentText.content[0]?.timing?.start || 0;
    
    audioPlayer = new Audio(currentText.audio);
    audioPlayer.preload = 'auto';
    isPlaying = false;
    currentVerseIndex = -1;
    audioPlayer._firstVerseStart = firstVerseStart;
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        updateAudioTime();
        // Seek to first verse start if needed
        if (firstVerseStart > 0) {
            audioPlayer.currentTime = firstVerseStart;
        }
    });
    
    audioPlayer.addEventListener('timeupdate', () => {
        updateAudioProgress();
        highlightCurrentVerse();
    });
    
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayButton();
        clearHighlight();
    });
    
    audioPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });
}

function toggleAudio() {
    if (!audioPlayer) return;
    
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        // If at start and has offset, seek first
        const firstVerseStart = audioPlayer._firstVerseStart || 0;
        if (firstVerseStart > 0 && audioPlayer.currentTime < firstVerseStart) {
            audioPlayer.currentTime = firstVerseStart;
        }
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
    updatePlayButton();
}

function updatePlayButton() {
    const playIcon = document.querySelector('.icon-play');
    const pauseIcon = document.querySelector('.icon-pause');
    if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }
    updateVersePlayIcons();
}

function updateVersePlayIcons() {
    document.querySelectorAll('.verse-play-icon').forEach(icon => {
        const tanakhVerseEl = icon.closest('.tanakh-verse');
        const textVerseEl = icon.closest('.verse');
        let isActive = false;
        if (tanakhVerseEl) {
            const num = parseInt(tanakhVerseEl.getAttribute('data-verse-num'), 10);
            isActive = isPlaying && num === tanakhActiveVerseNum;
        } else if (textVerseEl) {
            const idx = parseInt(textVerseEl.getAttribute('data-index'), 10);
            isActive = isPlaying && idx === currentVerseIndex;
        }
        icon.textContent = isActive ? '\u23F8' : '\u266A';
        icon.classList.toggle('is-playing', isActive);
        icon.setAttribute('title', isActive ? 'Pause' : 'Play from here');
    });
}

function updateAudioProgress() {
    if (!audioPlayer) return;
    
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    const progressBar = document.getElementById('audioProgress');
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    updateAudioTime();
}

function updateAudioTime() {
    if (!audioPlayer) return;
    
    const current = formatTime(audioPlayer.currentTime);
    const duration = formatTime(audioPlayer.duration || 0);
    const timeEl = document.getElementById('audioTime');
    if (timeEl) {
        timeEl.textContent = `${current} / ${duration}`;
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function seekAudio(event) {
    if (!audioPlayer) return;
    
    const container = event.currentTarget;
    const rect = container.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
}

function seekToVerse(index) {
    if (!audioPlayer || !currentText) return;

    if (isPlaying && index === currentVerseIndex) {
        audioPlayer.pause();
        isPlaying = false;
        updatePlayButton();
        return;
    }

    const verse = currentText.content[index];
    if (verse && verse.timing) {
        const targetTime = verse.timing.start;

        if (targetTime > audioPlayer.duration) return;

        const onSeeked = () => {
            audioPlayer.removeEventListener('seeked', onSeeked);
            audioPlayer.play();
            isPlaying = true;
            currentVerseIndex = index;
            updatePlayButton();
        };

        audioPlayer.addEventListener('seeked', onSeeked);
        audioPlayer.currentTime = targetTime;
    }
}

// Toggle click-to-play mode
function toggleClickToPlayMode() {
    clickToPlayMode = !clickToPlayMode;
    // Update button state
    const btn = document.querySelector('.click-to-play-btn');
    if (btn) {
        btn.classList.toggle('active', clickToPlayMode);
    }
    // Toggle visibility of verse play icons without re-initializing audio
    document.querySelectorAll('.verse-play-icon').forEach(icon => {
        icon.style.display = clickToPlayMode ? '' : 'none';
    });
}

let lastHighlightTime = 0;
function highlightCurrentVerse() {
    if (!audioPlayer || !currentText) return;
    
    // Throttle to max 4 updates per second
    const now = Date.now();
    if (now - lastHighlightTime < 250) return;
    lastHighlightTime = now;
    
    const currentTime = audioPlayer.currentTime;
    let newIndex = -1;
    
    // Start search from current verse index for efficiency
    const startIdx = Math.max(0, currentVerseIndex);
    const content = currentText.content;
    
    // Check current verse first (most common case)
    if (startIdx < content.length) {
        const verse = content[startIdx];
        if (verse.timing && currentTime >= verse.timing.start && currentTime < verse.timing.end) {
            newIndex = startIdx;
        }
    }
    
    // Check next verse (second most common - moving forward)
    if (newIndex === -1 && startIdx + 1 < content.length) {
        const verse = content[startIdx + 1];
        if (verse.timing && currentTime >= verse.timing.start && currentTime < verse.timing.end) {
            newIndex = startIdx + 1;
        }
    }
    
    // Fall back to linear search only if needed
    if (newIndex === -1) {
        for (let i = 0; i < content.length; i++) {
            const verse = content[i];
            if (verse.timing && currentTime >= verse.timing.start && currentTime < verse.timing.end) {
                newIndex = i;
                break;
            }
        }
    }
    
    if (newIndex !== currentVerseIndex) {
        clearHighlight();
        currentVerseIndex = newIndex;
        
        if (newIndex >= 0) {
            const verseEl = document.querySelector(`.verse[data-index="${newIndex}"]`);
            if (verseEl) {
                verseEl.classList.add('playing');
                // Scroll into view if needed
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        updateVersePlayIcons();
    }
}

function clearHighlight() {
    document.querySelectorAll('.verse.playing').forEach(el => {
        el.classList.remove('playing');
    });
    updateVersePlayIcons();
}

function switchAudioTrack(index) {
    if (!currentText || !currentText.audioTracks) return;
    
    index = parseInt(index, 10);
    const track = currentText.audioTracks[index];
    if (!track) return;
    
    const wasPlaying = isPlaying;
    
    // Clean up old player completely
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
        audioPlayer.load();
    }
    
    // Create new player with selected track
    console.log('Switching to track:', track.url);
    audioPlayer = new Audio(track.url);
    isPlaying = false;
    
    audioPlayer.addEventListener('loadedmetadata', () => {
        updateAudioTime();
        if (wasPlaying) {
            audioPlayer.play();
            isPlaying = true;
            updatePlayButton();
        }
    });
    
    audioPlayer.addEventListener('timeupdate', () => {
        updateAudioProgress();
        highlightCurrentVerse();
    });
    
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayButton();
        clearHighlight();
    });
    
    audioPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e, audioPlayer.error);
    });
    
    // Load the new audio
    audioPlayer.load();
}

// ========================================
// TANAKH SECTION
// ========================================

let tanakhIndex = null;
let currentBook = null;
let currentChapter = 1;

async function loadTanakhIndex() {
    if (tanakhIndex) return tanakhIndex;
    const response = await fetch('data/tanakh/index.json');
    tanakhIndex = await response.json();
    return tanakhIndex;
}

async function showTanakh() {
    window.location.hash = 'tanakh';
    
    const index = await loadTanakhIndex();
    
    let sectionsHtml = '';
    for (const section of index.sections) {
        const booksHtml = section.books.map(book => `
            <a class="text-card tanakh-book" href="#" onclick="showTanakhBook('${book.id}'); return false;">
                <div class="title-he">${book.title_he}</div>
                <div class="title-en">${book.title_en}</div>
                <div class="chapter-count">${book.chapters} chapters</div>
            </a>
        `).join('');
        
        sectionsHtml += `
            <div class="subcategory-section">
                <h2>${section.name}</h2>
                <div class="texts-grid tanakh-grid">
                    ${booksHtml}
                </div>
            </div>
        `;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="text-list-header">
            <h1>תנ״ך</h1>
            <h2>Tanakh - The Hebrew Bible</h2>
            <div class="breadcrumb">
                <a href="#" onclick="showHome(); return false;">Home</a>
                <span>›</span>
                <span>Tanakh</span>
            </div>
        </div>
        ${sectionsHtml}
    `;
}

const tanakhBookCache = new Map();

async function showTanakhBook(bookId, chapter = 1) {
    window.location.hash = `tanakh/${bookId}/${chapter}`;

    if (currentBook?.id === bookId) {
        currentChapter = chapter;
        renderTanakhChapter();
        return;
    }

    if (tanakhBookCache.has(bookId)) {
        currentBook = tanakhBookCache.get(bookId);
        currentChapter = chapter;
        renderTanakhChapter();
        return;
    }

    document.getElementById('app').innerHTML = `
        <div class="loading"><div class="spinner"></div></div>
    `;

    try {
        const response = await fetch(`data/tanakh/${bookId}.json`);
        if (!response.ok) throw new Error('Book not found');
        const book = await response.json();
        tanakhBookCache.set(bookId, book);
        currentBook = book;
        currentChapter = chapter;
        renderTanakhChapter();
    } catch (error) {
        console.error('Failed to load book:', error);
        document.getElementById('app').innerHTML = `
            <div class="text-list-header">
                <h1>Book not found</h1>
                <div class="breadcrumb">
                    <a href="#" onclick="showTanakh(); return false;">← Back to Tanakh</a>
                </div>
            </div>
        `;
    }
}

async function renderTanakhChapter() {
    if (!currentBook) return;
    
    const chapter = currentBook.chapters.find(c => c.chapter === currentChapter);
    if (!chapter) return;
    
    // Load citations index for cross-references
    await loadCitationsIndex();
    
    // Chapter navigation
    const totalChapters = currentBook.chapters.length;
    const chapterOptions = currentBook.chapters.map(c => 
        `<option value="${c.chapter}" ${c.chapter === currentChapter ? 'selected' : ''}>Chapter ${c.chapter}</option>`
    ).join('');
    
    const audioSegments = chapter.audioSegments || [];
    const hasAudio = audioSegments.length > 0;
    let audioToolbarHtml = '';
    if (hasAudio) {
        const trackSelectorHtml = audioSegments.length > 1 ? `
            <select class="audio-track-select" onchange="tanakhSwitchSegment(this.value)" title="Select aliyah">
                ${audioSegments.map(s => `<option value="${s.url}">${s.label}</option>`).join('')}
            </select>
        ` : `<span class="audio-segment-label">${audioSegments[0].label}</span>`;
        audioToolbarHtml = `
            <div class="audio-player tanakh-audio-player">
                <button class="audio-btn play-btn" onclick="toggleAudio()" title="Play/Pause">
                    <svg class="icon-play" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg class="icon-pause" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style="display:none">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                </button>
                <div class="audio-progress-container" onclick="seekAudio(event)">
                    <div class="audio-progress-bar">
                        <div class="audio-progress" id="audioProgress"></div>
                    </div>
                </div>
                <span class="audio-time" id="audioTime">0:00 / 0:00</span>
                <button class="audio-btn click-to-play-btn ${clickToPlayMode ? 'active' : ''}" onclick="toggleClickToPlayMode()" title="Click-to-play mode: click verse icons to play">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                </button>
                ${trackSelectorHtml}
            </div>
        `;
    }
    
    // Verses with cross-reference indicators
    // Layout: Hebrew (left) | verse number (center) | English (right)
    const versesHtml = chapter.verses.map(v => {
        const refKey = `${currentBook.id}:${currentChapter}:${v.verse}`;
        const refs = citationsIndex?.verse_refs?.[refKey] || [];
        const hasRefs = refs.length > 0;
        const verseHasAudio = !!(v.audio && v.timing);
        const playIconHtml = verseHasAudio
            ? `<span class="verse-play-icon" style="${clickToPlayMode ? '' : 'display:none'}" onclick="tanakhSeekToVerse(${v.verse}); event.stopPropagation();" title="Play from here">♪</span>`
            : '';
        const audioAttrs = verseHasAudio
            ? `data-audio="${v.audio}" data-start="${v.timing.start}" data-end="${v.timing.end}"`
            : '';
        return `
            <div class="tanakh-verse ${hasRefs ? 'has-refs' : ''} ${verseHasAudio ? 'has-timing' : ''}" id="verse-${v.verse}" data-verse-num="${v.verse}" ${audioAttrs}>
                ${playIconHtml}
                <div class="verse-hebrew">${v.hebrew}</div>
                <span class="verse-num" ${hasRefs ? `onclick="toggleVerseRefs('${refKey}', ${v.verse})" title="${refs.length} citation${refs.length > 1 ? 's' : ''}"` : ''}>${v.verse}${hasRefs ? '<span class="ref-indicator">*</span>' : ''}</span>
                <div class="verse-english">${v.english}</div>
            </div>
            ${hasRefs ? `<div class="verse-refs" id="refs-${v.verse}" style="display:none;"></div>` : ''}
        `;
    }).join('');
    
    document.getElementById('app').innerHTML = `
        <div class="reader-container tanakh-reader">
            <div class="reader-sticky">
                <div class="breadcrumb">
                    <a href="#" onclick="showHome(); return false;">Home</a>
                    <span>›</span>
                    <a href="#" onclick="showTanakh(); return false;">Tanakh</a>
                    <span>›</span>
                    <span>${currentBook.title_en}</span>
                </div>
                
                <div class="reader-header">
                    <h1 class="title-he">${currentBook.title_he}</h1>
                    <h2 class="title-en">${currentBook.title_en}</h2>
                </div>
                
                <div class="tanakh-nav">
                    <button class="nav-btn" onclick="prevChapter()" ${currentChapter <= 1 ? 'disabled' : ''}>
                        ← Previous
                    </button>
                    <select class="chapter-select" onchange="goToChapter(this.value)">
                        ${chapterOptions}
                    </select>
                    <button class="nav-btn" onclick="nextChapter()" ${currentChapter >= totalChapters ? 'disabled' : ''}>
                        Next →
                    </button>
                </div>
            </div>
            
            ${audioToolbarHtml}
            
            <div class="tanakh-content">
                ${versesHtml}
            </div>
            
            <div class="tanakh-nav bottom-nav">
                <button class="nav-btn" onclick="prevChapter()" ${currentChapter <= 1 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <span class="chapter-indicator">Chapter ${currentChapter} of ${totalChapters}</span>
                <button class="nav-btn" onclick="nextChapter()" ${currentChapter >= totalChapters ? 'disabled' : ''}>
                    Next →
                </button>
            </div>
        </div>
    `;

    if (hasAudio) {
        initTanakhAudio();
    } else {
        teardownAudioPlayer();
        tanakhAudioMode = false;
    }
}

function prevChapter() {
    if (currentChapter > 1) {
        showTanakhBook(currentBook.id, currentChapter - 1);
    }
}

function nextChapter() {
    if (currentChapter < currentBook.chapters.length) {
        showTanakhBook(currentBook.id, currentChapter + 1);
    }
}

function goToChapter(chapter) {
    showTanakhBook(currentBook.id, parseInt(chapter));
}

// ========================================
// TANAKH AUDIO SYNC (Torah readings)
// ========================================

function initTanakhAudio() {
    const chapter = currentBook?.chapters.find(c => c.chapter === currentChapter);
    const segments = chapter?.audioSegments || [];
    if (!segments.length) {
        teardownAudioPlayer();
        tanakhAudioMode = false;
        tanakhCurrentSegmentUrl = null;
        return;
    }
    tanakhAudioMode = true;
    loadTanakhSegment(segments[0].url, { autoplay: false, seekTo: null });
}

function teardownAudioPlayer() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
        audioPlayer.load();
        audioPlayer = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    isPlaying = false;
    tanakhActiveVerseNum = -1;
    clearTanakhHighlight();
}

function loadTanakhSegment(url, { autoplay = false, seekTo = null } = {}) {
    if (!url) return;
    const wasPlaying = isPlaying;
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
        audioPlayer.load();
    }
    audioPlayer = new Audio(url);
    audioPlayer.preload = 'auto';
    isPlaying = false;
    tanakhCurrentSegmentUrl = url;
    tanakhActiveVerseNum = -1;
    clearTanakhHighlight();

    audioPlayer.addEventListener('loadedmetadata', () => {
        updateAudioTime();
        if (typeof seekTo === 'number' && !Number.isNaN(seekTo)) {
            audioPlayer.currentTime = Math.min(seekTo, audioPlayer.duration || seekTo);
        }
        if (autoplay || wasPlaying) {
            audioPlayer.play();
            isPlaying = true;
            updatePlayButton();
        }
    });
    audioPlayer.addEventListener('timeupdate', () => {
        updateAudioProgress();
        highlightCurrentTanakhVerse();
    });
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayButton();
        clearTanakhHighlight();
    });
    audioPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e);
    });

    // Reflect the active segment in the dropdown.
    const select = document.querySelector('.tanakh-audio-player .audio-track-select');
    if (select) select.value = url;
}

function tanakhSeekToVerse(verseNum) {
    const verseEl = document.querySelector(`.tanakh-verse[data-verse-num="${verseNum}"]`);
    if (!verseEl) return;
    const url = verseEl.getAttribute('data-audio');
    const start = parseFloat(verseEl.getAttribute('data-start'));
    if (!url || Number.isNaN(start)) return;

    if (audioPlayer && isPlaying && verseNum === tanakhActiveVerseNum && url === tanakhCurrentSegmentUrl) {
        audioPlayer.pause();
        isPlaying = false;
        updatePlayButton();
        return;
    }

    if (url !== tanakhCurrentSegmentUrl) {
        loadTanakhSegment(url, { autoplay: true, seekTo: start });
        return;
    }
    if (!audioPlayer) return;
    const playFromHere = () => {
        if (audioPlayer.duration && start > audioPlayer.duration) return;
        audioPlayer.currentTime = start;
        audioPlayer.play();
        isPlaying = true;
        tanakhActiveVerseNum = verseNum;
        updatePlayButton();
    };
    if (audioPlayer.readyState >= 1) {
        playFromHere();
    } else {
        const onReady = () => {
            audioPlayer.removeEventListener('loadedmetadata', onReady);
            playFromHere();
        };
        audioPlayer.addEventListener('loadedmetadata', onReady);
    }
}

function tanakhSwitchSegment(url) {
    if (!url || url === tanakhCurrentSegmentUrl) return;
    // Seek to the first verse of this segment.
    const firstVerseEl = document.querySelector(`.tanakh-verse[data-audio="${url}"]`);
    const seekTo = firstVerseEl ? parseFloat(firstVerseEl.getAttribute('data-start')) : 0;
    loadTanakhSegment(url, { autoplay: false, seekTo: Number.isNaN(seekTo) ? 0 : seekTo });
}

function highlightCurrentTanakhVerse() {
    if (!audioPlayer || !tanakhAudioMode) return;
    const now = Date.now();
    if (now - lastHighlightTime < 250) return;
    lastHighlightTime = now;

    const t = audioPlayer.currentTime;
    let activeVerseNum = -1;
    document.querySelectorAll(`.tanakh-verse[data-audio="${tanakhCurrentSegmentUrl}"]`).forEach(el => {
        const start = parseFloat(el.getAttribute('data-start'));
        const end = parseFloat(el.getAttribute('data-end'));
        if (!Number.isNaN(start) && !Number.isNaN(end) && t >= start && t < end) {
            activeVerseNum = parseInt(el.getAttribute('data-verse-num'), 10);
        }
    });
    if (activeVerseNum !== tanakhActiveVerseNum) {
        clearTanakhHighlight();
        tanakhActiveVerseNum = activeVerseNum;
        if (activeVerseNum > 0) {
            const el = document.querySelector(`.tanakh-verse[data-verse-num="${activeVerseNum}"]`);
            if (el) {
                el.classList.add('playing');
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
        updateVersePlayIcons();
    }
}

function clearTanakhHighlight() {
    document.querySelectorAll('.tanakh-verse.playing').forEach(el => {
        el.classList.remove('playing');
    });
    updateVersePlayIcons();
}

// ========================================
// CITATION CROSS-REFERENCES
// ========================================

let citationsIndex = null;

async function loadCitationsIndex() {
    if (citationsIndex) return citationsIndex;
    try {
        const response = await fetch('data/citations.json');
        citationsIndex = await response.json();
    } catch (e) {
        citationsIndex = { text_citations: {}, verse_refs: {} };
    }
    return citationsIndex;
}

function makeCitationsClickable(html, textId) {
    // This will be called when rendering text content
    // Replace citation patterns with clickable links
    
    // English pattern
    html = html.replace(
        /\b(Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|I+\s*Samuel|I+\s*Kings|Isaiah|Jeremiah|Ezekiel|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Psalms?|Proverbs?|Job|Song\s*of\s*Songs?|Ruth|Lamentations|Ecclesiastes|Esther|Daniel|Ezra|Nehemiah|I+\s*Chronicles|Gen|Ex|Exod|Lev|Num|Deut|Josh|Judg|Isa|Jer|Ezek|Ps|Prov)\.?\s*(\d+)[:\.](\d+)/gi,
        (match, book, chapter, verse) => {
            const bookId = getBookId(book);
            if (bookId) {
                return `<a href="#tanakh/${bookId}/${chapter}" class="citation-link" data-verse="${verse}" onclick="showVersePopup('${bookId}', ${chapter}, ${verse}); return false;">${match}</a>`;
            }
            return match;
        }
    );
    
    return html;
}

function getBookId(bookName) {
    const map = {
        'genesis': 'genesis', 'gen': 'genesis',
        'exodus': 'exodus', 'ex': 'exodus', 'exod': 'exodus',
        'leviticus': 'leviticus', 'lev': 'leviticus',
        'numbers': 'numbers', 'num': 'numbers',
        'deuteronomy': 'deuteronomy', 'deut': 'deuteronomy',
        'joshua': 'joshua', 'josh': 'joshua',
        'judges': 'judges', 'judg': 'judges',
        'i samuel': 'i-samuel', 'ii samuel': 'ii-samuel',
        'i kings': 'i-kings', 'ii kings': 'ii-kings',
        'isaiah': 'isaiah', 'isa': 'isaiah',
        'jeremiah': 'jeremiah', 'jer': 'jeremiah',
        'ezekiel': 'ezekiel', 'ezek': 'ezekiel',
        'psalms': 'psalms', 'psalm': 'psalms', 'ps': 'psalms',
        'proverbs': 'proverbs', 'prov': 'proverbs',
        'job': 'job',
        'song of songs': 'song-of-songs',
        'ruth': 'ruth',
        'lamentations': 'lamentations',
        'ecclesiastes': 'ecclesiastes',
        'esther': 'esther',
        'daniel': 'daniel',
        'ezra': 'ezra',
        'nehemiah': 'nehemiah',
        'i chronicles': 'i-chronicles', 'ii chronicles': 'ii-chronicles',
        'hosea': 'hosea', 'joel': 'joel', 'amos': 'amos',
        'obadiah': 'obadiah', 'jonah': 'jonah', 'micah': 'micah',
        'nahum': 'nahum', 'habakkuk': 'habakkuk', 'zephaniah': 'zephaniah',
        'haggai': 'haggai', 'zechariah': 'zechariah', 'malachi': 'malachi'
    };
    const key = bookName.toLowerCase().trim().replace(/\./g, '');
    return map[key] || null;
}

async function showVersePopup(bookId, chapter, verse) {
    // Load the full chapter and scroll to the target verse
    try {
        const response = await fetch(`data/tanakh/${bookId}.json`);
        const book = await response.json();
        const chapterData = book.chapters.find(c => c.chapter === chapter);
        if (!chapterData) return;
        
        const verseNum = parseInt(verse);
        
        // Build all verses HTML with the target verse highlighted
        const versesHtml = chapterData.verses.map(v => {
            const isTarget = v.verse === verseNum;
            return `
                <div class="context-verse ${isTarget ? 'target-verse' : ''}" id="panel-verse-${v.verse}" onclick="closeSidePanel(); window.location.hash='tanakh/${bookId}/${chapter}#verse-${v.verse}';">
                    <span class="context-verse-num">${v.verse}</span>
                    <div class="context-verse-text">
                        <div class="context-hebrew">${v.hebrew}</div>
                        <div class="context-english">${v.english}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Load cross-references
        await loadCitationsIndex();
        const refKey = `${bookId}:${chapter}:${verse}`;
        const refs = citationsIndex.verse_refs[refKey] || [];
        
        let refsHtml = '';
        if (refs.length > 0) {
            refsHtml = `
                <div class="panel-refs">
                    <h4>Cited in ${refs.length} text${refs.length > 1 ? 's' : ''}:</h4>
                    <ul>
                        ${refs.map(r => `
                            <li><a href="#text/${r.text_id}#v${r.verse_index}" onclick="closeSidePanel(); navigateToVerse('${r.text_id}', ${r.verse_index}); return false;">${r.text_title}</a></li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        
        // Remove existing panel if any
        closeSidePanel();
        
        const panel = document.createElement('div');
        panel.className = 'side-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>${book.title_en} ${chapter}:${verse}</h3>
                <button class="panel-close" onclick="closeSidePanel()">×</button>
            </div>
            <div class="panel-content panel-scrollable">
                <div class="context-verses">
                    ${versesHtml}
                </div>
                ${refsHtml}
            </div>
            <div class="panel-footer">
                <a href="#tanakh/${bookId}/${chapter}#verse-${verse}" class="panel-link" onclick="closeSidePanel();">
                    Read full chapter →
                </a>
            </div>
        `;
        document.body.appendChild(panel);
        
        // Trigger animation and scroll to target verse
        requestAnimationFrame(() => {
            panel.classList.add('open');
            // Scroll to target verse within the panel
            setTimeout(() => {
                const targetEl = panel.querySelector(`#panel-verse-${verseNum}`);
                if (targetEl) {
                    targetEl.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }, 50);
        });
    } catch (e) {
        console.error('Failed to load verse:', e);
    }
}

function closeSidePanel() {
    const panel = document.querySelector('.side-panel');
    if (panel) {
        panel.classList.remove('open');
        setTimeout(() => panel.remove(), 300);
    }
}

function showSidePanel(html) {
    closeSidePanel();
    
    const panel = document.createElement('div');
    panel.className = 'side-panel';
    panel.innerHTML = html;
    document.body.appendChild(panel);
    
    // Trigger animation
    requestAnimationFrame(() => panel.classList.add('open'));
}

function togglePreviewExpand(btn) {
    const previewDiv = btn.previousElementSibling;
    const isExpanded = previewDiv.dataset.expanded === 'true';
    
    if (isExpanded) {
        previewDiv.innerHTML = decodeURIComponent(previewDiv.dataset.short);
        previewDiv.dataset.expanded = 'false';
        btn.textContent = 'Expand';
    } else {
        previewDiv.innerHTML = decodeURIComponent(previewDiv.dataset.long);
        previewDiv.dataset.expanded = 'true';
        btn.textContent = 'Collapse';
    }
}

// Keep old function name for compatibility
function closePopup() {
    closeSidePanel();
}

function closePopup() {
    const popup = document.querySelector('.verse-popup-overlay');
    if (popup) popup.remove();
}

// Show cross-references on Tanakh verse
async function showTanakhVerseRefs(bookId, chapter, verse) {
    await loadCitationsIndex();
    const refKey = `${bookId}:${chapter}:${verse}`;
    const refs = citationsIndex.verse_refs[refKey] || [];
    return refs;
}

async function toggleVerseRefs(refKey, verseNum) {
    const refs = citationsIndex?.verse_refs?.[refKey] || [];
    if (refs.length === 0) return;
    
    // Group citations by text_id
    const grouped = {};
    refs.forEach(r => {
        if (!grouped[r.text_id]) {
            grouped[r.text_id] = {
                title: r.text_title,
                citations: []
            };
        }
        // Avoid duplicate indices
        if (!grouped[r.text_id].citations.includes(r.verse_index)) {
            grouped[r.text_id].citations.push(r.verse_index);
        }
    });
    
    // Parse verse reference for display
    const [book, chapter, verse] = refKey.split(':');
    const bookName = book.charAt(0).toUpperCase() + book.slice(1);
    
    // Load previews for each text and each citation within
    const previewsHtml = await Promise.all(
        Object.entries(grouped).map(async ([textId, data]) => {
            let citationPreviews = [];
            try {
                const response = await fetch(`data/texts/${textId}.json`);
                const textData = await response.json();
                const content = textData.content || textData.sections?.commentary?.content || [];
                
                // Get preview for each citation index
                for (const idx of data.citations) {
                    const entry = content[idx];
                    if (entry) {
                        const fullText = entry.english || entry.hebrew || '';
                        const shortPreview = fullText.length > 300 ? fullText.substring(0, 300) + '...' : fullText;
                        const longPreview = fullText.length > 500 ? fullText.substring(0, 500) + '...' : fullText;
                        const canExpand = fullText.length > 300;
                        citationPreviews.push({
                            index: idx,
                            shortPreview: shortPreview,
                            longPreview: longPreview,
                            canExpand: canExpand
                        });
                    }
                }
            } catch (e) {
                console.error('Failed to load previews for', textId, e);
            }
            
            return `
                <div class="citation-source">
                    <div class="citation-source-title">
                        <strong>${data.title}</strong>
                        <span class="citation-count">(${data.citations.length} reference${data.citations.length > 1 ? 's' : ''})</span>
                    </div>
                    <div class="citation-previews">
                        ${citationPreviews.map((c, i) => `
                            <div class="citation-item" onclick="closeSidePanel(); navigateToVerse('${textId}', ${c.index});">
                                <div class="citation-preview" data-short="${encodeURIComponent(c.shortPreview)}" data-long="${encodeURIComponent(c.longPreview)}" data-expanded="false">${c.shortPreview}</div>
                                ${c.canExpand ? `<button class="expand-btn" onclick="event.stopPropagation(); togglePreviewExpand(this);">Expand</button>` : ''}
                                <a href="#text/${textId}#v${c.index}" class="citation-link-btn" onclick="event.stopPropagation(); closeSidePanel(); navigateToVerse('${textId}', ${c.index}); return false;">
                                    View in context →
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        })
    );
    
    // Build side panel content
    const panelHtml = `
        <div class="panel-header">
            <h3>${bookName} ${chapter}:${verse}</h3>
            <button class="panel-close" onclick="closeSidePanel()">×</button>
        </div>
        <div class="panel-content">
            <p class="refs-header">Cited in ${Object.keys(grouped).length} Karaite text${Object.keys(grouped).length > 1 ? 's' : ''}:</p>
            <div class="citations-list">
                ${previewsHtml.join('')}
            </div>
        </div>
    `;
    
    showSidePanel(panelHtml);
}

async function navigateToVerse(textId, verseIndex) {
    // Load the text first
    await showText(textId);
    
    // Wait for render, then scroll to the verse
    setTimeout(() => {
        const verseEl = document.querySelector(`.verse[data-index="${verseIndex}"]`);
        if (verseEl) {
            verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            verseEl.classList.add('highlight-verse');
            setTimeout(() => verseEl.classList.remove('highlight-verse'), 2000);
        }
    }, 100);
}
