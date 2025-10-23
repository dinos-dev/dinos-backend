## Dinos Api Server

> **Package**

```bash
# swagger module
$ pnpm install @nestjs/swagger
# http-status-code module
$ pnpm install http-status-codes

# common module 
$ pnpm install @nestjs/throttler
$ pnpm install @nestjs/config
$ pnpm install helmet
$ pnpm install hpp
$ pnpm install cross-env
$ pnpm install compression
$ pnpm install class-validator class-transformer
$ pnpm install @js-joda/core @js-joda/timezone

# common dependency
$ pnpm install -D @types/hpp
$ pnpm install @nestjs/axios 

# winston logging 
$ pnpm install nest-winston winston winston-daily-rotate-file 

# prisma 
$ pnpm install prisma --save-dev @prisma/client

# bcrypt
$ pnpm install bcrypt
$ pnpm install -D @types/bcrypt

# jwt 
$ pnpm install @nestjs/jwt
$ pnpm install jwks-rsa # get apple public access key
$ pnpm install jsonwebtoken # decoded apple jwt token

# passport 
$ pnpm install @nestjs/passport passport passport-local @types/passport-local passport-google-oauth20  passport-naver passport-custom
$ pnpm install passport-jwt @types/passport-jwt
$ pnpm install -D @types/passport-local @types/passport-naver

# aws-sdk v3 
$ pnpm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# uuid module
$ pnpm install uuid
$ pnpm install -D @types/uuid

# slack 
$ pnpm install @slack/web-api

# mongoose
$ pnpm install mongoose @nestjs/mongoose

# test library 
$ pnpm install jest-mock-extended
$ pnpm install --save-dev jest-mock-extended 

# cls module 
$ pnpm install nestjs-cls @nestjs-cls @nestjs-cls/transactional @nestjs-cls/transactional-adapter-prisma

# crypto
$ pnpm install crypto

# EventEmitter
$ pnpm install @nestjs/event-emitter

# firebase admin
$ pnpm install firebase-admin
```

</br>

----

</br>

> **DB Container Info**

- Postgres version: 16
- Managed via Docker Compose

> **Prerequisites**

- Docker OR Docker-Compose

> **Starting the Docker Container**

```bash
# Start the docker container

# dev 
$ NODE_ENV=development docker-compose up --build

# prod 
$ NODE_ENV=production docker-compose up --build 

```

> **Stopping the Docker Container**

```bash
# Stop the docker container
$ docker-compose down 
```


</br>

---

> How to start local environment

```bash
# clone and path project 
git clone https://github.com/dinos-dev/dinos-backend.git
cd dinos-backend

# !if you don't install pnpm, you must install pnpm
pnpm install 

# external dependence credentials ( sdk, api_key ... etc ) !see notion ( engineering docs )
touch config 

# see .env.example 
touch .env

# start docker compose 
docker-compose up --build

# start application 
pnpm start:dev

# production 
pnpm start:prod

```

</br>

---

> See Swagger Docs 

- swagger docs  -> [link](http://localhost/api-docs)


</br>

---

### prisma setup & migrate

- 실제 운영중에는 DDL 구문을 작성, dev container 환경에서만 local migrate 진행

```bash
# 최초 세팅에서만 적용
$ npx prisma init
# 스키마가 변경되었을 때, migration 파일 생성 및 generate
$ npx prisma migrate dev --name init
```
