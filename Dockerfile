FROM quay.io/upslopeio/node-alpine as build
WORKDIR /app
COPY . .
RUN npm install

FROM quay.io/upslopeio/node-alpine
COPY --from=build /app /app
RUN adduser -s /bin/sh -D node_user && chown -R node_user:node_user /app
USER node_user
CMD node /app/index.js
