FROM node:14

WORKDIR /app

COPY package*.json .
RUN npm install

COPY src/server.js /app/src/server.js

ENV PORT=80
EXPOSE 80
CMD node /app/src/server.js
