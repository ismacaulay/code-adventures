ORG=ismacaulay
APP=sh-api

.PHONY: image

image:
	docker build -t $(ORG)/$(APP) .

run:
	docker run --rm -it -p 8080:8080 $(ORG)/$(APP)

