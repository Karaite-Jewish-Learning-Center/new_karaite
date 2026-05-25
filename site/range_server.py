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
        
        # Check for range request
        range_header = self.headers.get('Range')
        
        if range_header:
            # Parse range header
            match = re.match(r'bytes=(\d+)-(\d*)', range_header)
            if match:
                file_size = os.path.getsize(path)
                start = int(match.group(1))
                end = int(match.group(2)) if match.group(2) else file_size - 1
                
                if start >= file_size:
                    self.send_error(416, "Requested Range Not Satisfiable")
                    return None
                
                end = min(end, file_size - 1)
                content_length = end - start + 1
                
                f = open(path, 'rb')
                f.seek(start)
                
                self.send_response(206)
                self.send_header("Content-type", self.guess_type(path))
                self.send_header("Content-Length", str(content_length))
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()
                
                return f
        
        # No range request, serve normally but advertise range support
        f = open(path, 'rb')
        file_size = os.path.getsize(path)
        
        self.send_response(200)
        self.send_header("Content-type", self.guess_type(path))
        self.send_header("Content-Length", str(file_size))
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        
        return f

if __name__ == '__main__':
    port = 8080
    server = HTTPServer(('', port), RangeRequestHandler)
    print(f"Serving on http://localhost:{port} with range request support")
    server.serve_forever()
