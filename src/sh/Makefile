
.PHONY: api web proxy build run

api:
	pushd api && make image && popd

web:
	pushd web && make image && popd

proxy:
	docker-compose build

build: api web proxy

run:
	docker-compose down && docker-compose up -d


