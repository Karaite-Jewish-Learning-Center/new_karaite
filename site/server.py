#!/usr/bin/env python3
"""
Simple HTTP server with range request support for audio/video seeking.
"""

import os
import re
from http.server import HTTPServer, SimpleHTTPRequestHandler

class RangeRequestHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        path = self.translate_path(self.path)
        
        if os.path.isdir(path):
            return super().send_head()
        
        if not os.path.exists(path):
            self.send_error(404, "File not found")
            return None
        
        file_size = os.path.getsize(path)
        
        # Check for range header
        range_header = self.headers.get('Range')
        
        if range_header:
            # Parse range header
            match = re.match(r'bytes=(\d*)-(\d*)', range_header)
            if match:
                start = match.group(1)
                end = match.group(2)
                
                start = int(start) if start else 0
                end = int(end) if end else file_size - 1
                
                if start >= file_size:
                    self.send_error(416, "Range not satisfiable")
                    return None
                
                end = min(end, file_size - 1)
                content_length = end - start + 1
                
                self.send_response(206)
                self.send_header("Content-Type", self.guess_type(path))
                self.send_header("Content-Length", content_length)
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()
                
                f = open(path, 'rb')
                f.seek(start)
                return _RangeFile(f, content_length)
        
        # No range request - serve full file
        self.send_response(200)
        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Content-Length", file_size)
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        
        return open(path, 'rb')

class _RangeFile:
    """Wrapper to read only a portion of a file."""
    def __init__(self, f, length):
        self.f = f
        self.remaining = length
    
    def read(self, size=-1):
        if self.remaining <= 0:
            return b''
        if size < 0 or size > self.remaining:
            size = self.remaining
        data = self.f.read(size)
        self.remaining -= len(data)
        return data
    
    def close(self):
        self.f.close()

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8082
    
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    server = HTTPServer(('', port), RangeRequestHandler)
    print(f"Serving on http://localhost:{port}")
    print("Press Ctrl+C to stop")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        server.shutdown()
