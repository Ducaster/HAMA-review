import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ReviewModule, AuthModule],
})
export class AppModule {}
