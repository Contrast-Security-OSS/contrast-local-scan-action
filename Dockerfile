FROM alpine:3.21.3

RUN apk upgrade && \
  apk add nodejs npm openjdk11-jre-headless tar zstd

COPY package.json /contrast-local-scanner/package.json
RUN cd /contrast-local-scanner && npm i --production

COPY src /contrast-local-scanner/src

ENTRYPOINT ["node", "/contrast-local-scanner/src/index.js"]