FROM node:16-alpine

WORKDIR /app

COPY package.json .

COPY yarn.lock .

RUN yarn install --immutable --immutable-cache --check-cache

COPY . .


CMD ["yarn", "start"]