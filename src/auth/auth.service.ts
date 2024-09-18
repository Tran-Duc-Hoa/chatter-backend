import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

import { User } from 'src/users/entities/user.entity';
import { getJwt } from './jwt';
import { TokenPayload } from './token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async login(user: User, res: Response) {
    const expires = new Date();
    expires.setSeconds(expires.getSeconds() + this.configService.getOrThrow('JWT_EXPIRATION'));

    const tokenPayload: TokenPayload = {
      ...user,
      _id: user._id.toHexString()
    };

    const token = this.jwtService.sign(tokenPayload);
    res.cookie('Authentication', token, { expires, httpOnly: true });

    return token;
  }

  verifyWs(request: Request, connectionParams: any = {}): TokenPayload {
    const cookies: string[] = request.headers.cookie?.split('; ');
    const authCookie = cookies?.find((cookie) => cookie.includes('Authentication'));
    const jwt = authCookie.split('Authentication=')[1];
    return this.jwtService.verify(jwt || getJwt(connectionParams.token));
  }

  async logout(res: Response) {
    res.cookie('Authentication', '', {
      httpOnly: true,
      expires: new Date()
    });
  }
}
