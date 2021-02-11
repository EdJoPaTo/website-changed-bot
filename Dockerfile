FROM docker.io/library/node:14-alpine AS builder
WORKDIR /build

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY source source
RUN node_modules/.bin/tsc

RUN rm -rf node_modules && npm ci --production


FROM docker.io/library/alpine:3.13
#FROM docker.io/library/node:14-alpine3.13
WORKDIR /app
VOLUME /app/persistent
VOLUME /app/users
VOLUME /app/websites

ENV NODE_ENV=production

RUN apk add --no-cache git bash nodejs

COPY gitconfig /root/.gitconfig
COPY package.json ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./

HEALTHCHECK --interval=5m \
    CMD bash -c '[[ $(find . -maxdepth 1 -name ".last-successful-run" -mmin "-25" -print | wc -l) == "1" ]]'

CMD node --unhandled-rejections=strict -r source-map-support/register index.js
