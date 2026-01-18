# -----------------------------------------------
# Stage 1: Dependencies
# -----------------------------------------------
FROM node:22-alpine AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Prisma schema 별도 복사 (postinstall에서 generate)
COPY prisma ./prisma

# 의존성 설치 (devDependencies 포함)
RUN pnpm install --frozen-lockfile

# -----------------------------------------------
# Stage 2: Builder
# -----------------------------------------------
FROM node:22-alpine AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 의존성 먼저 복사 (캐시 활용)
COPY --from=deps /app/node_modules ./node_modules

# 리소스 복사 
COPY . .

# 빌드 실행
RUN pnpm run build

# Prisma Client 생성 (prune 전에 실행 - prisma는 devDependency)
RUN npx prisma generate

# 프로덕션 의존성만 남기기
RUN pnpm prune --prod --ignore-scripts

# -----------------------------------------------
# Stage 3: Runner (Production)
# -----------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# 보안: non-root 사용자 설정
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# 프로덕션에 필요한 파일만 복사
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

# 로그 디렉토리 생성 -> 별도로 로그는 컨테이너 외부에서 관리하도록 처리 필요 
RUN mkdir -p ./dist/logs && chown -R nestjs:nodejs ./dist/logs

# non-root 사용자로 전환
USER nestjs

EXPOSE 3000

CMD ["node", "--enable-source-maps", "dist/main"]
