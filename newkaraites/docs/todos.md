Thing to fix:

# Fix the backend authentication
This should be something in the server configuration, it works fine on the local machine.

Possible causes:
# settings.py

# Ensure these settings are correctly configured
SESSION_COOKIE_DOMAIN = 'yourdomain.com'
SESSION_COOKIE_SECURE = True  # Set to False if not using HTTPS
CSRF_COOKIE_DOMAIN = 'yourdomain.com'
CSRF_COOKIE_SECURE = True  # Set to False if not using HTTPS
# nginx.conf

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Ensure these headers are set to handle cookies correctly
    proxy_set_header Cookie $http_cookie;
    proxy_pass_header Set-Cookie;
}


# Search all the books not only on bible.

Relevante commands:
    biblical_books.py
    create_hebrew_search.py
    create_hebrew_rank_search.py
    update_full_text.py
    update_full_text_search.py
    update_full_test_search_index.py


# Playing songs not working.
  Probably the path to the songs is wrong.


# Some song files are missing.
    Check the songs folder and the database.


# Future work
  59 spreadsheet files to be processed. With poems, songs, and other texts.

# Fix the comments 

