FROM quay.io/upslopeio/node-alpine as build
WORKDIR /app
COPY . .
RUN npm install

FROM quay.io/upslopeio/node-alpine
COPY --from=build /app /app
CMD node /app/index.js
