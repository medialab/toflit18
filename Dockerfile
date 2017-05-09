FROM node:7.9.0-alpine

ARG API_ENDPOINT=/api

ENV NODE_ENV production
ENV API_ENDPOINT=${API_ENDPOINT}

RUN apk add --no-cache su-exec

RUN mkdir -p /toflit18/ /toflit18/client

ADD ./package.json /toflit18/
ADD ./client/package.json /toflit18/client/

RUN cd /toflit18/client/ && npm --quiet install --production false
RUN cd /toflit18/ && npm --quiet install --production false

ADD . /toflit18

RUN cd /toflit18 && npm run build
RUN cd /toflit18/client/ && npm run build

WORKDIR /toflit18

VOLUME /toflit18/client/

EXPOSE 4000

ENTRYPOINT ["su-exec", "node:node"] 

CMD ["/usr/local/bin/node", "./build/toflit18.js"]
