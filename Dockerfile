FROM node:10-alpine
WORKDIR /app
VOLUME /app/persistent
VOLUME /app/websites

ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install

COPY . ./
CMD ["npm", "start"]
