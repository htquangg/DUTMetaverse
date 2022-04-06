FROM node:17

WORKDIR /usr/src/dut-server

COPY package.json ./

COPY tsconfig.json ./

COPY . .

RUN npm install

EXPOSE 3000
