import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // ✅ ConfigService 추가
import Redis from 'ioredis';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ 요청에서 JWT 추출
      ignoreExpiration: false, // ✅ 만료된 토큰 거부
      secretOrKey: configService.get<string>('JWT_SECRET'), // ✅ 환경변수에서 시크릿 키 가져오기
    });

    this.redisClient = new Redis({
      host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
      port: configService.get<number>('REDIS_PORT', 6379),
      password: configService.get<string>('REDIS_PASSWORD', ''),
    });
  }

  async validate(payload: any) {
    console.log(`🔑 JWT Payload:`, payload);

    const userKey = `user:${payload.sub}`;
    const user = await this.redisClient.get(userKey);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return JSON.parse(user);
  }
}
