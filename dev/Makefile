export DATABASE_URL=postgresql://admin:password123@localhost:5432/webapp

local-db-up:
	docker-compose --file ./docker-compose-db.yml up --build &

local-db-down:
	docker-compose --file ./docker-compose-db.yml down

local-backend-run:
	cd ../backend; uvicorn main:app --host 0.0.0.0 --port 8000 --reload

open-firefox:
	firefox file:///home/grzegorz/Project/ml/service_www/frontend/index.html