from nginx:stable-alpine

RUN rm -rf /usr/share/nginx/html

COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
ADD build /usr/share/nginx/html
