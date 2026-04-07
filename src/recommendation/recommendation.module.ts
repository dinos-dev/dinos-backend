import { Module } from '@nestjs/common';
import { RecommendationService } from './application/recommendation.service';
import { RecommendationController } from './presentation/recommendation.controller';
import { RECOMMENDATION_QUERY_REPOSITORY } from 'src/common/config/common.const';
import { RecommendationQuery } from './infrastructure/query/recommendation.query';

@Module({
  controllers: [RecommendationController],
  providers: [
    RecommendationService,
    {
      provide: RECOMMENDATION_QUERY_REPOSITORY,
      useClass: RecommendationQuery,
    },
  ],
})
export class RecommendationModule {}
