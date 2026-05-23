#!/usr/bin/env python3
"""
RAG Chatbot Server for Karaite Texts Library
Uses Ollama for embeddings and chat completion
"""

import json
import os
import numpy as np
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs
import requests

# Configuration
OLLAMA_BASE = "http://localhost:11434"
EMBED_MODEL = "nomic-embed-text"
CHAT_MODEL = "llama3.1:8b"
TEXTS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "texts")
INDEX_FILE = os.path.join(os.path.dirname(__file__), "embeddings_index.json")

# Global index
chunks = []
embeddings = None


def get_embedding(text, retries=3):
    """Get embedding from Ollama with retry logic"""
    for attempt in range(retries):
        try:
            resp = requests.post(
                f"{OLLAMA_BASE}/api/embeddings",
                json={"model": EMBED_MODEL, "prompt": text},
                timeout=30
            )
            data = resp.json()
            if "embedding" in data:
                return data["embedding"]
            else:
                print(f"  Warning: No embedding in response: {str(data)[:100]}")
        except Exception as e:
            print(f"  Retry {attempt+1}/{retries} for embedding: {e}")
        import time
        time.sleep(1)
    raise Exception(f"Failed to get embedding after {retries} retries")


def get_embeddings_batch(texts):
    """Get embeddings for multiple texts"""
    return [get_embedding(t) for t in texts]


def cosine_similarity(a, b):
    """Compute cosine similarity between two vectors"""
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def load_texts():
    """Load all texts and create chunks - one chunk per text with full context"""
    global chunks
    chunks = []
    
    # Load catalog for metadata
    catalog_path = os.path.join(os.path.dirname(__file__), "..", "data", "catalog.json")
    catalog_meta = {}
    try:
        with open(catalog_path, 'r', encoding='utf-8') as f:
            catalog = json.load(f)
            for category, subcats in catalog.items():
                for subcat, texts in subcats.items():
                    for t in texts:
                        catalog_meta[t['id']] = {
                            'category': category,
                            'subcategory': subcat,
                            'title_he': t.get('title_he', '')
                        }
    except:
        pass
    
    for filename in os.listdir(TEXTS_DIR):
        if not filename.endswith('.json'):
            continue
        
        filepath = os.path.join(TEXTS_DIR, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except:
            continue
        
        text_id = filename[:-5]
        title = data.get('title_en', text_id)
        title_he = data.get('title_he', '')
        meta = catalog_meta.get(text_id, {})
        category = meta.get('category', '')
        subcategory = meta.get('subcategory', '')
        
        # Build full text content
        full_content = []
        
        # Add metadata header for better matching
        header = f"Title: {title}"
        if title_he:
            header += f" ({title_he})"
        if category:
            header += f". Category: {category}"
        if subcategory:
            header += f", {subcategory}"
        full_content.append(header)
        
        # Add introduction
        intro = data.get('introduction', '')
        if intro and intro != 'Introduction':
            full_content.append(f"Introduction: {intro}")
        
        # Add all verses - combine English and transliteration
        content = data.get('content', [])
        verses_text = []
        for verse in content:
            parts = []
            if verse.get('english'):
                parts.append(verse['english'])
            if verse.get('transliteration'):
                parts.append(f"({verse['transliteration']})")
            if parts:
                verses_text.append(' '.join(parts))
        
        if verses_text:
            full_content.append("Content: " + ' '.join(verses_text))
        
        # Create single chunk for short texts, or split for long ones
        full_text = '\n'.join(full_content)
        
        # Max content length for embedding model (nomic-embed-text has ~8k token limit, ~4k chars safe)
        MAX_CHUNK_CHARS = 3500
        
        if len(full_text) <= 2000:
            # Single chunk for short texts
            chunks.append({
                'text_id': text_id,
                'title': title,
                'title_he': title_he,
                'category': category,
                'subcategory': subcategory,
                'type': 'full',
                'content': full_text[:MAX_CHUNK_CHARS],
                'display': full_text[:600]
            })
        else:
            # Split into intro + content chunks for long texts
            if intro and intro != 'Introduction':
                intro_content = f"{header}\n{intro}"
                chunks.append({
                    'text_id': text_id,
                    'title': title,
                    'title_he': title_he,
                    'category': category,
                    'subcategory': subcategory,
                    'type': 'introduction',
                    'content': intro_content[:MAX_CHUNK_CHARS],
                    'display': intro[:600]
                })
            
            # Split content into smaller chunks
            content_text = ' '.join(verses_text)
            chunk_size = 1500
            for i in range(0, len(content_text), chunk_size):
                chunk_text = content_text[i:i+chunk_size]
                chunks.append({
                    'text_id': text_id,
                    'title': title,
                    'title_he': title_he,
                    'category': category,
                    'subcategory': subcategory,
                    'type': 'content',
                    'content': f"{header}\n{chunk_text}",
                    'display': chunk_text[:600]
                })
    
    print(f"Loaded {len(chunks)} chunks from {len(os.listdir(TEXTS_DIR))} files")
    return chunks


def build_index():
    """Build embeddings index"""
    global embeddings, chunks
    
    if os.path.exists(INDEX_FILE):
        print("Loading existing index...")
        with open(INDEX_FILE, 'r') as f:
            data = json.load(f)
            chunks = data['chunks']
            embeddings = np.array(data['embeddings'])
            print(f"Loaded {len(chunks)} chunks")
            return
    
    print("Building new index...")
    load_texts()
    
    print(f"Computing embeddings for {len(chunks)} chunks...")
    embeddings_list = []
    for i, chunk in enumerate(chunks):
        if i % 50 == 0:
            print(f"  Processing {i}/{len(chunks)}...")
        emb = get_embedding(chunk['content'])
        embeddings_list.append(emb)
    
    embeddings = np.array(embeddings_list)
    
    # Save index
    with open(INDEX_FILE, 'w') as f:
        json.dump({
            'chunks': chunks,
            'embeddings': embeddings_list
        }, f)
    print("Index saved")


def search(query, top_k=5):
    """Search for relevant chunks - combines semantic and keyword matching"""
    query_emb = get_embedding(query)
    query_lower = query.lower()
    query_words = set(query_lower.split())
    
    similarities = []
    for i, emb in enumerate(embeddings):
        # Semantic similarity
        sem_sim = cosine_similarity(query_emb, emb)
        
        # Keyword boost - check if query words appear in content or title
        chunk = chunks[i]
        content_lower = chunk['content'].lower()
        title_lower = chunk['title'].lower()
        
        keyword_boost = 0
        for word in query_words:
            if len(word) > 3:  # Only match meaningful words
                if word in title_lower:
                    keyword_boost += 0.15
                if word in content_lower:
                    keyword_boost += 0.05
        
        # Combined score
        combined = sem_sim + keyword_boost
        similarities.append((combined, i))
    
    similarities.sort(reverse=True)
    
    results = []
    for score, idx in similarities[:top_k]:
        chunk = chunks[idx].copy()
        chunk['score'] = float(score)
        results.append(chunk)
    
    return results


def chat(query, context_chunks):
    """Generate response using Ollama"""
    # Build context from chunks with clear structure
    context_parts = []
    for i, chunk in enumerate(context_chunks, 1):
        cat_info = ""
        if chunk.get('category'):
            cat_info = f" [{chunk['category']}"
            if chunk.get('subcategory'):
                cat_info += f" > {chunk['subcategory']}"
            cat_info += "]"
        
        context_parts.append(f"[Source {i}] {chunk['title']}{cat_info}:\n{chunk['display']}")
    
    context = "\n\n".join(context_parts)
    
    system_prompt = """You are a knowledgeable assistant for the Karaite Jewish Texts Library (KJLC).

ABOUT KARAITE JUDAISM:
- Karaite Jews follow the Hebrew Bible (Tanakh) as the sole religious authority
- They do not follow the Rabbinic Oral Torah (Talmud, Mishnah)
- The library contains prayers, liturgy, halakhah (religious law), commentaries, and poetry

YOUR TASK:
1. Answer questions using ONLY the provided source texts
2. Quote relevant passages when helpful
3. Always cite which text(s) your answer comes from
4. If a text is a prayer or poem, describe its purpose/occasion
5. If the sources don't contain the answer, say "The library texts provided don't contain information about this topic."

Be concise, accurate, and helpful."""

    user_prompt = f"""SOURCES FROM THE LIBRARY:

{context}

USER QUESTION: {query}

Provide a helpful answer based on the sources above:"""

    resp = requests.post(
        f"{OLLAMA_BASE}/api/generate",
        json={
            "model": CHAT_MODEL,
            "prompt": user_prompt,
            "system": system_prompt,
            "stream": False,
            "options": {
                "temperature": 0.3,
                "num_predict": 500
            }
        }
    )
    
    return resp.json()["response"]


class ChatHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        if self.path == '/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            query = data.get('query', '')
            
            # Search for relevant chunks
            results = search(query, top_k=5)
            
            # Generate response
            response = chat(query, results)
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps({
                'response': response,
                'sources': [{'title': r['title'], 'text_id': r['text_id']} for r in results[:3]]
            }).encode())
        
        elif self.path == '/search':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            query = data.get('query', '')
            results = search(query, top_k=5)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            self.wfile.write(json.dumps({'results': results}).encode())
        
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")


def main():
    print("Karaite Texts RAG Server")
    print("=" * 40)
    
    # Build or load index
    build_index()
    
    # Start server
    port = 8083
    server = HTTPServer(('', port), ChatHandler)
    print(f"\nServer running on http://localhost:{port}")
    print("Endpoints:")
    print("  POST /chat   - Chat with the texts")
    print("  POST /search - Semantic search")
    print("\nPress Ctrl+C to stop")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        server.shutdown()


if __name__ == '__main__':
    main()
