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
$ pnpm install csurf
$ pnpm install hpp
$ pnpm install cross-env
$ pnpm install compression
$ pnpm install class-validator class-transformer
# common dependecy
$ pnpm install -D @types/csurf @types/hpp

# winston logging 
$ pnpm install nest-winston winston winston-daily-rotate-file 

# typeorm & mysql2 
$ pnpm install @nestjs/typeorm typeorm mysql2
$ pnpm install typeorm-naming-strategies

# bcrypt
$ pnpm install bcrypt
$ pnpm install -D @types/bcrypt

# jwt 
$ pnpm install @nestjs/jwt

# passport 
$ pnpm install @nestjs/passport passport passport-local @types/passport-local
$ pnpm install passport-jwt @types/passport-jwt

# aws-sdk v3 
$ pnpm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

```

</br>

----

</br>

> **DB Container Info**

- MySQL version: 8.0.33
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