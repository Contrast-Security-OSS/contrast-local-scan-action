FROM alpine:3.21.3@sha256:a8560b36e8b8210634f77d9f7f9efd7ffa463e380b75e2e74aff4511df3ef88c

RUN apk upgrade && \
  apk add nodejs npm openjdk21-jre-headless tar zstd

COPY package.json /contrast-local-scanner/package.json
RUN cd /contrast-local-scanner && npm i --production

ENV ACTIONS_CACHE_SERVICE_V2=true

COPY src /contrast-local-scanner/src

ENTRYPOINT ["node", "/contrast-local-scanner/src/index.js"]