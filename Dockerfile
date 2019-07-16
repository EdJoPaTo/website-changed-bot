FROM node:12-alpine
WORKDIR /app
VOLUME /app/persistent
VOLUME /app/websites

ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci

COPY source ./
CMD node index.js
