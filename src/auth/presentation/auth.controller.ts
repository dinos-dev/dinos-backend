import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCommonErrorResponseTemplate } from 'src/common/swagger/response/api-error-common-response';

import { Request } from 'express';
import { AuthService } from 'src/auth/application/auth.service';

import { HttpResponse } from 'src/common/http/http-response';
import { LocalLoginDocs, LogOutDocs, RotateAccessTokenDocs, SocialLoginDocs } from './swagger/rest-swagger.decorator';
import { RefreshTokenGuard } from 'src/auth/presentation/guard/refresh-token.guard';
import { UserId } from 'src/common/decorator/user-id.decorator';
import { Authorization } from 'src/auth/presentation/decorator/authorization.decorator';
import { AuthGuard } from '@nestjs/passport';
import { SocialToken } from 'src/auth/presentation/decorator/social-token.decorator';
import { OAuthPayLoad } from 'src/auth/domain/interface/token-payload.interface';

import { Public } from 'src/common/decorator/public-access.decorator';
import { CreateUserDto } from 'src/user/presentation/dto/request/create-user.dto';
import { LoginResponseDto, RotateAccessTokenDto } from './dto/response/login-response.dto';
import { SocialUserCommand } from '../application/command/social-user.command';

@ApiTags('Auth - 인증')
@ApiCommonErrorResponseTemplate()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //? Naver OAuth Register & Login
  @SocialLoginDocs()
  @Public()
  @Post('naver')
  @UseGuards(AuthGuard('naver'))
  async naverLogin(@Req() req: Request, @SocialToken() token: OAuthPayLoad): Promise<HttpResponse<LoginResponseDto>> {
    const command = new SocialUserCommand(token.email, token.name, token.provider, token.providerId);

    const data = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), command);
    const tokens = LoginResponseDto.fromResult(data);

    return HttpResponse.created(tokens);
  }

  //? Google OAuth Register & Login
  @SocialLoginDocs()
  @Public()
  @Post('google')
  @UseGuards(AuthGuard('google'))
  async googleLogin(@Req() req: Request, @SocialToken() token: OAuthPayLoad): Promise<HttpResponse<LoginResponseDto>> {
    const command = new SocialUserCommand(token.email, token.name, token.provider, token.providerId);

    const data = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), command);

    const tokens = LoginResponseDto.fromResult(data);
    return HttpResponse.created(tokens);
  }

  //? Apple OAuth Register & Login
  @SocialLoginDocs()
  @Public()
  @Post('apple')
  @UseGuards(AuthGuard('apple'))
  async appleLogin(@Req() req: Request, @SocialToken() token: OAuthPayLoad) {
    const command = new SocialUserCommand(token.email, token.name, token.provider, token.providerId);

    const data = await this.authService.socialLogin(req.get('user-agent').toLowerCase(), command);

    const tokens = LoginResponseDto.fromResult(data);
    return HttpResponse.created(tokens);
  }

  //? Local Register & Login
  @LocalLoginDocs()
  @Public()
  @Post('local')
  async localLogin(@Req() req: Request, @Body() dto: CreateUserDto): Promise<HttpResponse<LoginResponseDto>> {
    const command = dto.toCommand();

    const data = await this.authService.localLogin(req.get('user-agent').toLowerCase(), command);

    const tokens = LoginResponseDto.fromResult(data);
    return HttpResponse.created(tokens);
  }

  //? Renew Access Token By Refresh Token
  @Public()
  @RotateAccessTokenDocs()
  @UseGuards(RefreshTokenGuard)
  @Post('token/access')
  async rotateAccessToken(
    @UserId() userId: number,
    @Authorization() token: string,
  ): Promise<HttpResponse<RotateAccessTokenDto>> {
    const data = await this.authService.rotateAccessToken(userId, token);

    const accessToken = RotateAccessTokenDto.fromResult(data);

    return HttpResponse.created(accessToken);
  }

  //? logout
  @LogOutDocs()
  @Post('logout')
  async logOut(@UserId() userId: number): Promise<HttpResponse<void>> {
    await this.authService.removeRefToken(userId);
    return HttpResponse.noContent();
  }
}
