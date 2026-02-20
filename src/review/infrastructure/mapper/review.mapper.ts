import { Review } from '@prisma/client';
import { ReviewEntity } from 'src/review/domain/entities/review.entity';

export class ReviewMapper {
  static toDomain(prismaReview: Review): ReviewEntity {
    return new ReviewEntity(
      prismaReview.id,
      prismaReview.userId,
      prismaReview.restaurantId,
      prismaReview.content,
      prismaReview.wantRecommendation,
      prismaReview.createdAt,
      prismaReview.updatedAt,
      prismaReview.deletedAt,
      prismaReview.version,
    );
  }
}
