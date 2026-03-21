FROM node:18-alpine
RUN apk --no-cache add curl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 8080

CMD ["node","src/index.js"]

HEALTHCHECK CMD curl --fail http://localhost:8080 || exit 1