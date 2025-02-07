import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  // ✅ ID 유효성 검사 함수
  private validateObjectId(id: string): Types.ObjectId {
    if (!mongoose.isValidObjectId(id)) {
      throw new BadRequestException(`Invalid ID format: ${id}`);
    }
    return new Types.ObjectId(id);
  }

  // ✅ 썸네일 URL 생성 함수
  private generateThumbnailUrl(imageUrl: string): string {
    return imageUrl.replace(
      'https://hama-post-image.s3.ap-northeast-2.amazonaws.com/uploads/',
      'https://hama-post-thumbnail.s3.ap-northeast-2.amazonaws.com/thumbnails/',
    ); // ✅ 경로 변경
  }

  // ✅ 상품 등록
  async createReview(
    createReviewDto: CreateReviewDto,
    googleId: string,
  ): Promise<Review> {
    const { imageUrls } = createReviewDto;

    // ✅ imageUrls을 변형하여 thumbnailUrls 생성
    const thumbnailUrls = imageUrls.map((url) =>
      this.generateThumbnailUrl(url),
    );

    const newReview = new this.reviewModel({
      ...createReviewDto,
      googleId, // ✅ 작성자 구글 ID 추가
      thumbnailUrls, // ✅ 썸네일 URL 추가
    });

    return newReview.save();
  }

  // ✅ 전체 상품 조회
  async getAllReviews(): Promise<Review[]> {
    return this.reviewModel.find().exec();
  }

  // ✅ 특정 상품 조회
  async getReviewById(id: string): Promise<Review> {
    const objectId = this.validateObjectId(id); // ✅ ID 변환 및 검증
    const review = await this.reviewModel.findById(objectId).exec();
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    return review;
  }

  // ✅ 상품 수정
  async updateReview(
    id: string,
    updateReviewDto: UpdateReviewDto,
    userGoogleId: string,
  ): Promise<Review> {
    const objectId = this.validateObjectId(id); // ✅ ID 변환 및 검증
    // 기존 리뷰 데이터 조회
    const existingReview = await this.reviewModel.findById(objectId).exec();
    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }
    // ✅ 작성자 검증
    if (existingReview.googleId !== userGoogleId) {
      throw new ForbiddenException(
        'You are not authorized to update this review',
      );
    }

    // ✅ imageUrls가 변경되었는지 확인
    if (updateReviewDto.imageUrls) {
      // ✅ 새 imageUrls를 기반으로 새로운 thumbnailUrls 생성
      updateReviewDto.thumbnailUrls = updateReviewDto.imageUrls.map((url) =>
        this.generateThumbnailUrl(url),
      );
    }

    // ✅ 데이터 업데이트
    const updatedReview = await this.reviewModel
      .findByIdAndUpdate(id, updateReviewDto, { new: true })
      .exec();

    if (!updatedReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return updatedReview;
  }

  // ✅ 상품 삭제
  async deleteReview(
    id: string,
    userGoogleId: string,
  ): Promise<{ message: string }> {
    const objectId = this.validateObjectId(id); // ✅ ID 변환 및 검증
    const review = await this.reviewModel.findById(objectId).exec();
    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // ✅ 작성자 검증
    if (review.googleId !== userGoogleId) {
      throw new ForbiddenException(
        'You are not authorized to delete this review',
      );
    }

    await this.reviewModel.findByIdAndDelete(id).exec();
    return { message: 'Review deleted successfully' };
  }

  // ✅ 특정 사용자가 작성한 후기 조회
  async getReviewsByUser(googleId: string): Promise<Review[]> {
    const reviews = await this.reviewModel.find({ googleId }).exec();
    if (!reviews.length) {
      throw new NotFoundException(`No reviews found for user ${googleId}`);
    }
    return reviews;
  }
}
