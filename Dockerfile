FROM mhart/alpine-node:8 as base
RUN apk update && apk upgrade && apk add --no-cache \
    bash \
    git \
    openssh
RUN adduser -D appuser -h /app

FROM base AS build
WORKDIR /app
USER appuser
COPY --chown=appuser:appuser . .
RUN npm install
RUN npm run build

FROM base AS run
WORKDIR /app
USER appuser
COPY --chown=appuser:appuser . .
COPY --chown=appuser:appuser --from=build /app/dist /app/dist
RUN npm install --production
EXPOSE 4000
ENV PORT 4000
CMD ["npm", "start"]

