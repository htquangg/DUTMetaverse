FROM node:lts

WORKDIR /usr/src/dut-server

COPY package.json ./

COPY tsconfig.json ./

COPY prisma ./prisma/

COPY .env ./

COPY . .

RUN apt-get -qy update && apt-get -qy install openssl

RUN yarn

RUN yarn add @prisma/client

RUN npx prisma generate --schema ./prisma/schema.prisma

EXPOSE 3000
