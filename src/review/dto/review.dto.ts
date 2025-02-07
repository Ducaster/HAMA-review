import { IsBoolean, IsString, IsUrl, IsArray } from 'class-validator';

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

  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls: string[]; // ✅ 여러 개의 이미지 URL 배열

  @IsArray()
  @IsUrl({}, { each: true })
  thumbnailUrls?: string[]; // ✅ 여러 개의 썸네일 URL 배열 (선택적 필드)

  @IsString()
  googleId: string;
}

export class UpdateReviewDto extends CreateReviewDto {}
