FROM node:10-alpine
WORKDIR /app

ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm install

COPY . ./
CMD ["npm", "start"]
