ORG=ismacaulay
APP=sh-web

.PHONY: build image run

build:
	yarn build

image: build
	docker build -t $(ORG)/$(APP) .

run:
	docker run --rm -it -p 5000:80 $(ORG)/$(APP)

