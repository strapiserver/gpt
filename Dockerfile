FROM node:20.12.0-alpine3.18

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn config set network-timeout 550000 -g && yarn install

COPY . .

RUN yarn build

EXPOSE 5001

CMD ["yarn", "start"]