/**
 * Chat Widget for Karaite Texts Library
 * Connects to local RAG server
 */

const CHAT_API = 'http://localhost:8083';

// Create chat widget HTML
function createChatWidget() {
    const widget = document.createElement('div');
    widget.id = 'chat-widget';
    widget.innerHTML = `
        <button id="chat-toggle" class="chat-toggle" title="Ask about the texts">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        </button>
        <div id="chat-panel" class="chat-panel hidden">
            <div class="chat-header">
                <span>Ask about Karaite Texts</span>
                <button id="chat-close" class="chat-close">&times;</button>
            </div>
            <div id="chat-messages" class="chat-messages">
                <div class="chat-message bot">
                    <p>Hello! I can help you explore the Karaite texts library. Ask me about prayers, holidays, halakhah, or any topic in the collection.</p>
                </div>
            </div>
            <div class="chat-input-container">
                <input type="text" id="chat-input" class="chat-input" placeholder="Ask a question..." autocomplete="off">
                <button id="chat-send" class="chat-send">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);
    
    // Event listeners
    document.getElementById('chat-toggle').addEventListener('click', toggleChat);
    document.getElementById('chat-close').addEventListener('click', toggleChat);
    document.getElementById('chat-send').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

function toggleChat() {
    const panel = document.getElementById('chat-panel');
    const toggle = document.getElementById('chat-toggle');
    panel.classList.toggle('hidden');
    toggle.classList.toggle('active');
    
    if (!panel.classList.contains('hidden')) {
        document.getElementById('chat-input').focus();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const query = input.value.trim();
    
    if (!query) return;
    
    // Add user message
    addMessage(query, 'user');
    input.value = '';
    
    // Show loading
    const loadingId = addMessage('Thinking...', 'bot loading');
    
    try {
        const response = await fetch(`${CHAT_API}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        
        if (!response.ok) throw new Error('Server error');
        
        const data = await response.json();
        
        // Remove loading message
        document.getElementById(loadingId).remove();
        
        // Add response
        let responseHtml = data.response;
        
        // Add sources
        if (data.sources && data.sources.length > 0) {
            responseHtml += '<div class="chat-sources"><strong>Sources:</strong> ';
            responseHtml += data.sources.map(s => 
                `<a href="#" onclick="showText('${s.text_id}'); return false;">${s.title}</a>`
            ).join(', ');
            responseHtml += '</div>';
        }
        
        addMessage(responseHtml, 'bot', true);
        
    } catch (error) {
        document.getElementById(loadingId).remove();
        addMessage('Sorry, I couldn\'t connect to the server. Make sure the RAG server is running on port 8083.', 'bot error');
    }
}

function addMessage(text, type, isHtml = false) {
    const messages = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    const id = 'msg-' + Date.now();
    msg.id = id;
    msg.className = `chat-message ${type}`;
    
    if (isHtml) {
        msg.innerHTML = `<p>${text}</p>`;
    } else {
        msg.innerHTML = `<p>${escapeHtml(text)}</p>`;
    }
    
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    
    return id;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
} else {
    createChatWidget();
}
