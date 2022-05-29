FROM node:14 as builder

WORKDIR /build
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY src/ .
RUN npm run build

FROM node:14

WORKDIR /usr/src/app
COPY --from=builder /build/package*.json ./
RUN npm ci --production

COPY --from=builder /build/dist ./
ENV PORT 80
CMD [ "node", "server.js" ]