#!/bin/bash
docker logs postgres --tail 100 > /var/log/postgres-container.log 2>&1
docker stats postgres --no-stream >> /var/log/postgres-stats.log 2>&1 