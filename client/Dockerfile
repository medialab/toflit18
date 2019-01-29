FROM nginx:1.13-alpine

ARG API_ENDPOINT=/api

ENV API_PORT=4000
ENV API_HOST=api
ENV API_ENDPOINT=${API_ENDPOINT}

RUN mkdir /toflit18/

ADD client /toflit18/client
ADD lib /toflit18/lib


WORKDIR /toflit18/client


RUN apk add --no-cache nodejs \
    && npm --quiet install \
    && ln -s /toflit18/client/node_modules /toflit18/lib/node_modules \
    && npm run build  \
    && npm cache clean --force \
    && apk del nodejs \
    && rm -fr ./node_modules \
    && rm -fr /usr/lib/node_modules /root/.config /root/.npm

RUN rm /etc/nginx/conf.d/default.conf

COPY client/docker-nginx-vhost.template /etc/nginx/conf.d/docker-nginx-vhost.template

COPY client/docker-entrypoint.sh /

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["nginx", "-g", "daemon off;"]

