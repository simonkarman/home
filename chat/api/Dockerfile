FROM node:14 as builder

WORKDIR /build
COPY package*.json ./
COPY tsconfig.json ./
RUN yarn install --frozen-lockfile
COPY src/ .
RUN yarn build

FROM node:14

WORKDIR /usr/src/app
COPY --from=builder /build/package*.json ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /build/dist ./
ENV PORT 80
CMD [ "node", "server.js" ]
