FROM node:18.18-alpine

WORKDIR /finance-app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]
