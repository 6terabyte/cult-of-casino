FROM node:18.13.0-alpine

WORKDIR /app

RUN apk update
RUN apk add yarn

ADD package.json ./

COPY . .

RUN yarn run pkg
