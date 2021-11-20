FROM registry.access.redhat.com/ubi7/nodejs-12 as build
WORKDIR /app
COPY . .
RUN npm install

FROM quay.io/upslopeio/node-alpine
COPY --from=build /app /app
RUN adduser -s /bin/sh -D node_user && chown -R node_user:node_user /app
USER node_user
ENV NODE_PORT=8080
CMD node /app/index.js
EXPOSE 8080
