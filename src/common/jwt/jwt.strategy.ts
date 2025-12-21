import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { JwtPayload } from 'src/types/RequestWithUser';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('jwt_access_secret');
    if (!jwtSecret) {
      throw new Error('jwt_access_secret is not defined in env');
    }

    super({
      jwtFromRequest: (req: Request) => {
        const token = req.headers['authorization'];
        if (token && typeof token === 'string') {
          return token;
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
