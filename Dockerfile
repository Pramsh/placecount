# syntax=docker/dockerfile:1.19
FROM node:24-alpine AS dependencies
WORKDIR /app

RUN corepack enable
COPY .yarnrc.yml package.json yarn.lock ./
COPY app/package.json ./app/package.json
COPY modules/package.json ./modules/package.json
RUN yarn install --immutable

FROM dependencies AS production
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./package.json
COPY app/package.json ./app/package.json
COPY --exclude=**/*.test.* --exclude=**/*.spec.* app/src ./app/src
COPY modules/package.json ./modules/package.json
COPY --exclude=**/*.test.* --exclude=**/*.spec.* modules/src ./modules/src

USER node
EXPOSE 3000
CMD ["node", "app/src/core/index.ts"]

FROM dependencies AS development
WORKDIR /app

ENV NODE_ENV=development

COPY package.json ./package.json
COPY app/package.json ./app/package.json
COPY app/src ./app/src
COPY modules/package.json ./modules/package.json
COPY modules/src ./modules/src

USER node
EXPOSE 3000
CMD ["node", "app/src/core/index.ts"]
