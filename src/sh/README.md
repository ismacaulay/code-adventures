sh - a url shortener

### web

the `web` directory contains the front-end application for sh.

**tech:** react, typescript

### api

the `api` directory contains the backend api for sh

**Tech:** golang, redis

### features

- [x] convert a long url to a short url
- [x] specify the timeframe the url is valid for
  - 1 time use, 1 hour, 1 day
- [ ] admin portal to allow the addition of permanent urls with fixed uids
- [ ] admin portal authentication using basic auth

### Building

`make build` - builds all of the images

`make run` - starts the docker containers and service

The site will be available at http://localhost:5000

### Why not deploy this?

sh is a weekend project to learn a little bit of new tech (golang, react, redis). Unfortunately
url shorteners can be used with malicious intent, so if you would like to play with it feel free
to download the code and run it. It is in no way production ready, but was just fun to build.
