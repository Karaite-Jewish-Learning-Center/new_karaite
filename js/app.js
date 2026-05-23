/**
 * Karaite Texts - Minimal JavaScript
 * Handles navigation, text display, and toggle controls
 */

// State
let catalog = null;
let currentText = null;

// Initialize
document.addEventListener('DOMContentLoaded', init);

async function init() {
    // Load catalog
    try {
        const response = await fetch('data/catalog.json');
        catalog = await response.json();
    } catch (e) {
        console.error('Failed to load catalog:', e);
    }
    
    // Route based on URL params
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';
    const cat = params.get('cat');
    const subcat = params.get('subcat');
    const text = params.get('text');
    
    if (text) {
        await loadTextPage(text);
    } else if (subcat) {
        loadSubcategoryPage(cat, subcat);
    } else if (cat) {
        loadCategoryPage(cat);
    } else if (page === 'texts') {
        loadTextsPage();
    } else {
        loadHomePage();
    }
}

// Home page
function loadHomePage() {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="container">
            <div class="hero">
                <h1>Karaite Jewish Learning Center</h1>
                <p>Explore centuries of Karaite literature: prayers, poetry, halakhah, and more. 
                   All texts with Hebrew, transliteration, and English translation.</p>
            </div>
            <div class="category-list" id="category-list"></div>
        </div>
    `;
    
    if (catalog) {
        renderCategories();
    }
}

// Texts page (all categories)
function loadTextsPage() {
    const main = document.querySelector('main');
    main.innerHTML = `
        <div class="container">
            <h1 class="page-title">Texts</h1>
            <p class="page-subtitle">Browse by category</p>
            <div class="category-list" id="category-list"></div>
        </div>
    `;
    
    if (catalog) {
        renderCategories();
    }
}

// Render category list
function renderCategories() {
    const container = document.getElementById('category-list');
    if (!container || !catalog) return;
    
    // Category display names (Hebrew)
    const hebrewNames = {
        'Liturgy': 'תפילה ושירה',
        'Halakhah': 'הלכה',
        'Polemics': 'פולמוס',
        'Comments': 'פירושים',
        'Poetry (Non-Liturgical)': 'שירה',
        'Exhortatory Literature': 'ספרות מוסר',
    };
    
    let html = '';
    for (const [cat, data] of Object.entries(catalog.categories)) {
        if (cat === 'HTML') continue; // Skip scratch folder
        
        const count = countTextsInCategory(data);
        html += `
            <a href="?cat=${encodeURIComponent(cat)}" class="category-item">
                <span class="category-name-he">${hebrewNames[cat] || ''}</span>
                <span class="category-name-en">${cat} (${count})</span>
            </a>
        `;
    }
    container.innerHTML = html;
}

function countTextsInCategory(data) {
    let count = data.texts ? data.texts.length : 0;
    if (data.subcategories) {
        for (const texts of Object.values(data.subcategories)) {
            count += texts.length;
        }
    }
    return count;
}

// Category page
function loadCategoryPage(cat) {
    const main = document.querySelector('main');
    const data = catalog?.categories[cat];
    
    if (!data) {
        main.innerHTML = '<div class="container"><p>Category not found</p></div>';
        return;
    }
    
    let html = `
        <div class="container">
            <a href="?" class="back-link">← All categories</a>
            <h1 class="page-title">${cat}</h1>
    `;
    
    // Subcategories
    if (data.subcategories && Object.keys(data.subcategories).length > 0) {
        html += '<div class="category-list">';
        for (const [subcat, texts] of Object.entries(data.subcategories)) {
            html += `
                <a href="?cat=${encodeURIComponent(cat)}&subcat=${encodeURIComponent(subcat)}" class="category-item">
                    <span class="category-name-he"></span>
                    <span class="category-name-en">${formatSubcategoryName(subcat)} (${texts.length})</span>
                </a>
            `;
        }
        html += '</div>';
    }
    
    // Direct texts
    if (data.texts && data.texts.length > 0) {
        html += '<div class="text-list">';
        for (const textId of data.texts) {
            const textInfo = catalog.texts.find(t => t.id === textId);
            if (textInfo) {
                html += renderTextItem(textInfo);
            }
        }
        html += '</div>';
    }
    
    html += '</div>';
    main.innerHTML = html;
}

// Subcategory page
function loadSubcategoryPage(cat, subcat) {
    const main = document.querySelector('main');
    const textIds = catalog?.categories[cat]?.subcategories[subcat];
    
    if (!textIds) {
        main.innerHTML = '<div class="container"><p>Subcategory not found</p></div>';
        return;
    }
    
    let html = `
        <div class="container">
            <a href="?cat=${encodeURIComponent(cat)}" class="back-link">← ${cat}</a>
            <h1 class="page-title">${formatSubcategoryName(subcat)}</h1>
            <div class="text-list">
    `;
    
    for (const textId of textIds) {
        const textInfo = catalog.texts.find(t => t.id === textId);
        if (textInfo) {
            html += renderTextItem(textInfo);
        }
    }
    
    html += '</div></div>';
    main.innerHTML = html;
}

function formatSubcategoryName(name) {
    return name.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
}

function renderTextItem(textInfo) {
    return `
        <a href="?text=${encodeURIComponent(textInfo.id)}" class="text-item">
            <span class="text-title-he">${textInfo.title_he || ''}</span>
            <span class="text-title-en">${textInfo.title_en || textInfo.id}</span>
        </a>
    `;
}

// Text reader page
async function loadTextPage(textId) {
    const main = document.querySelector('main');
    main.innerHTML = '<div class="container"><p>Loading...</p></div>';
    
    try {
        const response = await fetch(`data/texts/${textId}.json`);
        if (!response.ok) throw new Error('Text not found');
        currentText = await response.json();
        renderTextPage();
    } catch (e) {
        main.innerHTML = `<div class="container"><p>Error loading text: ${e.message}</p></div>`;
    }
}

function renderTextPage() {
    if (!currentText) return;
    
    const main = document.querySelector('main');
    const backUrl = currentText.subcategory 
        ? `?cat=${encodeURIComponent(currentText.category)}&subcat=${encodeURIComponent(currentText.subcategory)}`
        : `?cat=${encodeURIComponent(currentText.category)}`;
    
    const hasIntro = currentText.introduction || currentText.about_author || 
                     (currentText.metadata && Object.keys(currentText.metadata).length > 0);
    const hasContent = currentText.content && currentText.content.length > 0;
    
    let html = `
        <div class="container">
            <a href="${backUrl}" class="back-link">← Back</a>
            
            <div class="reader-header">
                <div class="reader-title-he">${currentText.title_he || ''}</div>
                <div class="reader-title-en">${currentText.title_en || ''}</div>
            </div>
    `;
    
    // Tabs (if both intro and content exist)
    if (hasIntro && hasContent) {
        html += `
            <div class="reader-tabs">
                <button class="tab-btn active" data-tab="text">Text</button>
                <button class="tab-btn" data-tab="intro">Introduction</button>
            </div>
        `;
    }
    
    // Toggle controls (for text view)
    if (hasContent) {
        html += `
            <div class="reader-controls" id="reader-controls">
                <button class="toggle-btn active" data-toggle="hebrew">Hebrew</button>
                <button class="toggle-btn active" data-toggle="transliteration">Transliteration</button>
                <button class="toggle-btn active" data-toggle="english">English</button>
            </div>
        `;
    }
    
    // Text content
    if (hasContent) {
        html += `<div class="tab-content active" id="tab-text"><div class="text-content" id="text-content">`;
        for (let i = 0; i < currentText.content.length; i++) {
            const verse = currentText.content[i];
            html += `
                <div class="verse" data-index="${i}">
                    <div class="verse-row">
                        <div class="verse-hebrew">${cleanText(verse.hebrew)}</div>
                        <div class="verse-transliteration">${cleanText(verse.transliteration)}</div>
                    </div>
                    <div class="verse-english">${cleanText(verse.english)}</div>
                </div>
            `;
        }
        html += '</div></div>';
    }
    
    // Introduction content
    if (hasIntro) {
        html += `<div class="tab-content${!hasContent ? ' active' : ''}" id="tab-intro"><div class="introduction">`;
        
        if (currentText.introduction) {
            html += `<p>${currentText.introduction}</p>`;
        }
        
        if (currentText.metadata && Object.keys(currentText.metadata).length > 0) {
            html += '<div class="metadata">';
            for (const [key, value] of Object.entries(currentText.metadata)) {
                if (value) {
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                    html += `<div class="metadata-item"><span class="metadata-label">${label}:</span>${value}</div>`;
                }
            }
            html += '</div>';
        }
        
        if (currentText.about_author) {
            html += `
                <div class="about-author">
                    <h3>About the Author</h3>
                    <p>${currentText.about_author}</p>
                </div>
            `;
        }
        
        html += '</div></div>';
    }
    
    html += '</div>';
    main.innerHTML = html;
    
    // Set up event listeners
    setupToggleButtons();
    setupTabs();
}

function cleanText(text) {
    if (!text) return '';
    // Clean up whitespace issues from HTML parsing
    return text
        .replace(/\n\s*/g, ' ')  // Replace newlines with space
        .replace(/\s+/g, ' ')     // Collapse multiple spaces
        .trim();
}

function setupToggleButtons() {
    const controls = document.getElementById('reader-controls');
    const content = document.getElementById('text-content');
    if (!controls || !content) return;
    
    controls.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const type = btn.dataset.toggle;
            content.classList.toggle(`hide-${type}`);
        });
    });
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update buttons
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
            
            // Show/hide controls (only for text tab)
            const controls = document.getElementById('reader-controls');
            if (controls) {
                controls.style.display = btn.dataset.tab === 'text' ? 'flex' : 'none';
            }
        });
    });
}
