-- pg_trgm: 한글 식당명 부분일치(ILIKE '%kw%') 검색 가속용 확장
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- restaurants.name trigram GIN 인덱스 (좌표 기반 식당명 검색용)
CREATE INDEX "idx_restaurants_name_trgm" ON "restaurants" USING GIN ("name" gin_trgm_ops);
