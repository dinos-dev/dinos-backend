import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repository/user.repository';
import { PROFILE_REPOSITORY, TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/core/config/common.const';
import { ProfileRepository } from './repository/profile.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { TokenRepository } from '../auth/repository/token.repository';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PROFILE_REPOSITORY,
      useClass: ProfileRepository,
    },
    {
      provide: TOKEN_REPOSITORY,
      useClass: TokenRepository,
    },
    PrismaService,
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
