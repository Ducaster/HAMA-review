import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard'; // JWT 인증 추가

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard) // ✅ JWT 인증 추가
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.createReview(createReviewDto);
  }

  @Get()
  async getAllreviews() {
    return this.reviewService.getAllReviews();
  }

  @Get(':id')
  async getReviewById(@Param('id') id: string) {
    return this.reviewService.getReviewById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard) // ✅ JWT 인증 추가
  async updateReview(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard) // ✅ JWT 인증 추가
  async deleteReview(@Param('id') id: string) {
    return this.reviewService.deleteReview(id);
  }
}
