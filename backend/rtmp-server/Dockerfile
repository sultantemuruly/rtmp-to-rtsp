FROM node:18-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000 1935 8000
