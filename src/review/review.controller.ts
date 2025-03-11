import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // ✅ 상품 등록
  @Post()
  @UseGuards(JwtAuthGuard)
  async createReview(@Body() createReviewDto: CreateReviewDto, @Req() req) {
    const googleId = req.user.googleId;
    return this.reviewService.createReview(createReviewDto, googleId);
  }

  // ✅ 전체 상품 조회
  @Get()
  async getAllReviews() {
    return this.reviewService.getAllReviews();
  }

  // ✅ 특정 사용자의 후기 조회
  @Get('/my-reviews')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@Req() req) {
    const googleId = req.user.googleId;
    return this.reviewService.getReviewsByUser(googleId);
  }

  // ✅ 특정 상품 조회
  @Get(':id')
  async getReviewById(@Param('id') id: string) {
    return this.reviewService.getReviewById(id);
  }

  // ✅ 상품 수정
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
    @Req() req,
  ) {
    const googleId = req.user.googleId;
    return this.reviewService.updateReview(id, updateReviewDto, googleId);
  }

  // ✅ 상품 삭제
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteReview(@Param('id') id: string, @Req() req) {
    const googleId = req.user.googleId;
    return this.reviewService.deleteReview(id, googleId);
  }

  // ✅ 특정 사용자의 모든 후기 삭제
  @Delete()
  @UseGuards(JwtAuthGuard)
  async deleteReviewsByUser(@Req() req) {
    const googleId = req.user.googleId;
    return this.reviewService.deleteReviewsByUser(googleId);
  }
}
