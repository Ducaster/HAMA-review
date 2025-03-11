import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService], // ✅ 다른 모듈에서 사용할 경우 추가
})
export class ReviewModule {}
