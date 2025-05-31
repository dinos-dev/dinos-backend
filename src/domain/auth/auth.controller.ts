import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/core/swagger/response/api-error-common-response';

import { Request } from 'express';
import { AuthService } from './auth.service';

import { HttpResponse } from 'src/core/http/http-response';
import { LocalLoginDocs, LogOutDocs, RotateAccessTokenDocs, SocialLoginDocs } from './swagger/rest-swagger.decorator';
import { RefreshTokenGuard } from './guard/refresh-token.guard';
import { SocialUserDto } from '../user/dto/request/social-user.dto';
import { UserId } from '../user/decorator/user-id.decorator';
import { Authorization } from './decorator/authorization.decorator';
import { AuthGuard } from '@nestjs/passport';
import { SocialToken } from './decorator/social-token.decorator';
import { OAuthPayLoad } from './interface/token-payload.interface';

import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { HttpErrorConstants } from 'src/core/http/http-error-objects';
import { Public } from 'src/core/decorator/public-access.decorator';
import { CreateUserDto } from '../user/dto/request/create-user.dto';
import { LoginResponseDto, RotateAccessTokenDto } from './dto/login-response.dto';

@ApiTags('Auth - 인증')
@ApiCommonErrorResponseTemplate()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Naver OAuth Register & Login
  @SocialLoginDocs()
  @Public()
  @Post('naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin(@Req() req: Request, @SocialToken() token: OAuthPayLoad): Promise<HttpResponse<LoginResponseDto>> {
    const dto = plainToClass(SocialUserDto, token);
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_INTERNAL_SERVER_ERROR);
    }
    const data = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(data);
  }

  // Google OAuth Register & Login
  @SocialLoginDocs()
  @Public()
  @Post('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: Request, @SocialToken() token: OAuthPayLoad): Promise<HttpResponse<LoginResponseDto>> {
    const dto = plainToClass(SocialUserDto, token);
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new UnauthorizedException(HttpErrorConstants.SOCIAL_TOKEN_INTERNAL_SERVER_ERROR);
    }
    const data = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(data);
  }

  // Apple OAuth Register & Login
  @Post('apple')
  async appleLogin(@Req() req: Request, @SocialToken() token: OAuthPayLoad) {
    console.log(req);
    console.log(token);
    return HttpResponse.created();
  }

  // Local Register & Login
  @LocalLoginDocs()
  @Public()
  @Post('local')
  async localLogin(@Req() req: Request, @Body() dto: CreateUserDto): Promise<HttpResponse<LoginResponseDto>> {
    const data = await this.authService.localLogin(req.get('user-agent').toLowerCase(), dto);
    return HttpResponse.created(data);
  }

  // 토큰 재발급
  @RotateAccessTokenDocs()
  @UseGuards(RefreshTokenGuard)
  @Post('token/access')
  async rotateAccessToken(
    @UserId() userId: number,
    @Authorization() token: string,
  ): Promise<HttpResponse<RotateAccessTokenDto>> {
    const accessToken = await this.authService.rotateAccessToken(userId, token);
    return HttpResponse.created({ accessToken });
  }

  // 로그아웃
  @LogOutDocs()
  @Post('logout')
  async logOut(@UserId() userId: number): Promise<HttpResponse<void>> {
    await this.authService.removeRefToken(userId);
    return HttpResponse.noContent();
  }
}
