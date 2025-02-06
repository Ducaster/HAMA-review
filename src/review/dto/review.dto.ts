import { IsBoolean, IsString, IsUrl } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  ageGroup: string;

  @IsUrl()
  purchaseLink: string;

  @IsBoolean()
  recommended: boolean;

  @IsUrl()
  imageUrl: string; // ✅ S3 이미지 URL 필드
}

export class UpdateReviewDto extends CreateReviewDto {}
