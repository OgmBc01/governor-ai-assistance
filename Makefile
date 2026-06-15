.PHONY: up down build logs clean shell-mysql shell-backend

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build --no-cache

logs:
	docker-compose logs -f

clean:
	docker-compose down -v
	rm -rf ./mysql_data
	rm -rf ./qdrant_data

shell-mysql:
	docker exec -it bauchi_mysql mysql -u bauchi_admin -p

shell-backend:
	docker exec -it bauchi_backend sh

shell-frontend:
	docker exec -it bauchi_frontend sh

restart:
	docker-compose restart

status:
	docker-compose ps