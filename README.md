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

# test library 
$ pnpm install jest-mock-extended
$ pnpm install --save-dev jest-mock-extended 
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

# see .env.example 
touch .env.production .env.development 

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
