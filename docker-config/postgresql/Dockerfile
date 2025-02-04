FROM postgres:17

# Install matching psql client and contrib modules using the existing repo configuration
RUN apt-get update \
    && apt-get install -y postgresql-client postgresql-contrib \
    && rm -rf /var/lib/apt/lists/* 