## Dinos Api Server

> **Package**

```bash
# swagger module
$ pnpm add @nestjs/swagger
# http-status-code module
$ pnpm add http-status-codes

# common module 
$ pnpm add @nestjs/throttler
$ pnpm add @nestjs/config
$ pnpm add helmet
$ pnpm add csurf
$ pnpm add hpp
$ pnpm add cross-env
$ pnpm add compression

# common dependecy
$ pnpm add -D @types/csurf @types/hpp

# winston logging 
$ pnpm add nest-winston winston winston-daily-rotate-file 

# typeorm & mysql2 
$ pnpm add @nestjs/typeorm typeorm mysql2

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