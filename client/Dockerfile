FROM nginx:stable-alpine

ENV API_PORT=4000
ENV API_HOST=api

RUN rm /etc/nginx/conf.d/default.conf

COPY docker-nginx.conf /etc/nginx/conf.d/docker.template

CMD /bin/sh -c "envsubst < /etc/nginx/conf.d/docker.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
