#!/bin/bash

# Create certs directory if it doesn't exist
mkdir -p certs

# Generate self-signed certificate for development
if [ ! -f certs/karaites.crt ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/karaites.key \
        -out certs/karaites.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=kjlc.karaites.org" \
        -addext "subjectAltName=DNS:kjlc.karaites.org,DNS:karaites.org"
    
    echo "Development certificates generated successfully!"
else
    echo "Certificates already exist!"
fi 