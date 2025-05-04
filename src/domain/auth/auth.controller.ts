import { Controller, HttpCode, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/response/api-error-common-response';

import { Request } from 'express';
import { AuthService } from './auth.service';

import { HttpResponse } from 'src/core/http/http-response';
import { LogOutDocs, RotateAccessTokenDocs, SocialLoginDocs } from './swagger/rest-swagger.decorator';
import { RefreshTokenGuard } from './guard/refresh-token.guard';
import { SocialUserDto } from '../user/dto/social-user.dto';
import { UserId } from '../user/decorator/user-id.decorator';
import { Authorization } from './decorator/authorization.decorator';
import { AuthGuard } from '@nestjs/passport';
import { SocialToken } from './decorator/social-token.decorator';
import { OAuthPayLoad } from './interface/token-payload.interface';

import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { Public } from 'src/core/decorator/public-access.decorator';

@ApiTags('Auth - 인증')
@ApiCommonErrorResponseTemplate()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SocialLoginDocs()
  @Public()
  @Post('naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin(@Req() req: Request, @SocialToken() token: OAuthPayLoad) {
    console.log('naver login->', token);
    return HttpResponse.ok();
  }

  @SocialLoginDocs()
  @Public()
  @Post('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: Request, @SocialToken() token: OAuthPayLoad) {
    const dto = plainToClass(SocialUserDto, token);
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_INTERNAL_SERVER_ERROR);
    }
    const data = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.ok(data);
  }

  // // 소셜 가입 & 로그인
  // @SocialLoginDocs()
  // @Post('social-login')
  // async socialLogin(@Req() req: Request, @Body() dto: SocialUserDto) {
  //   const token = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), dto);
  //   return HttpResponse.created(token);
  // }

  // 토큰 재발급
  @RotateAccessTokenDocs()
  @UseGuards(RefreshTokenGuard)
  @Post('token/access')
  async rotateAccessToken(@UserId() userId: number, @Authorization() token: string) {
    const accessToken = await this.authService.rotateAccessToken(userId, token);
    return HttpResponse.created({ accessToken });
  }

  // 로그아웃
  @LogOutDocs()
  @Post('logout')
  @HttpCode(204)
  async logOut(@UserId() userId: number) {
    await this.authService.removeRefToken(userId);
    return HttpResponse.noContent();
  }
}
