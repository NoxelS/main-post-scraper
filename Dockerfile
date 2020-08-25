FROM node:10

RUN apt-get update
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN npm ci --only=production
COPY /dist .

CMD [ "npm", "start" ]