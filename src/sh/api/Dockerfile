#
# build the executable
#
FROM golang:alpine AS builder

RUN apk update && apk add --no-cache git

# ensure we are in the go path directory
WORKDIR $GOPATH/src/sh/sh-api
COPY . .

# install dependencies
RUN go mod download
RUN go mod verify

# build binary
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /go/bin/sh-api

#
# build a small image
#
FROM alpine:latest

COPY --from=builder /go/bin/sh-api /go/bin/sh-api

CMD ["/go/bin/sh-api"]
