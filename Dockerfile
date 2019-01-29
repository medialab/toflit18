FROM node:7.9.0-alpine

ENV NODE_ENV production

RUN apk add --no-cache su-exec

RUN mkdir /toflit18/

ADD . /toflit18

RUN cd /toflit18/ \
    && npm --quiet install --production false \
    && npm run build \
    && npm cache clean --force \
    && rm -fr /root/.npm /tmp/npm*

RUN chown -R node:node /toflit18/

WORKDIR /toflit18

EXPOSE 4000

ENTRYPOINT ["su-exec", "node:node"] 

CMD ["/usr/local/bin/node", "./build/toflit18.js"]
