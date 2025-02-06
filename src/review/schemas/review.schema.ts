import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema()
export class Review {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  ageGroup: string; // 사용 연령

  @Prop({ required: true })
  purchaseLink: string; // 구매처 링크

  @Prop({ required: true })
  recommended: boolean; // 추천 여부

  @Prop({ required: true })
  imageUrl: string; // ✅ S3에 업로드된 이미지 링크
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
