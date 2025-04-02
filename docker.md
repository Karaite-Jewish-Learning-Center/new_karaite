## Run docker compose

docker compose down
docker system prune -f
docker compose -f docker-compose-development.yml up -d --build

