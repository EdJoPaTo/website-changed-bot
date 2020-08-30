FROM node:14-alpine
WORKDIR /build

COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

COPY source source
RUN node_modules/.bin/tsc

RUN rm -rf node_modules && npm ci --production


FROM node:14-alpine
WORKDIR /app
VOLUME /app/persistent
VOLUME /app/users
VOLUME /app/websites

ENV NODE_ENV=production

RUN apk add --no-cache git bash

COPY gitconfig /root/.gitconfig
COPY package.json ./
COPY --from=0 /build/node_modules ./node_modules
COPY --from=0 /build/dist ./

HEALTHCHECK --interval=5m \
    CMD bash -c '[[ $(find . -maxdepth 1 -name ".last-successful-run" -mmin "-25" -print | wc -l) == "1" ]]'

CMD node index.js
