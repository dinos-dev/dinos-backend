FROM node:20-alpine

RUN npm i -g pnpm

WORKDIR /app

COPY package.json .

RUN pnpm install

COPY . .

RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "start:prod" ]
