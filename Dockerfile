FROM mhart/alpine-node:8 as base
RUN apk update && \
    apk upgrade && \
    apk add --no-cache bash git openssh
WORKDIR /usr/src
COPY package.json /usr/src/
RUN npm install --production
COPY . .

FROM mhart/alpine-node:base-8
WORKDIR /usr/src
ENV NODE_ENV="production"
COPY --from=base /usr/src .
CMD ["node", "server.js"]

