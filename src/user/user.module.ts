import { Module } from '@nestjs/common';
import { UserService } from 'src/user/application/user.service';
import { UserController } from 'src/user/presentation/user.controller';
import { UserRepository } from 'src/user/infrastructure/repository/user.repository';
import { PROFILE_REPOSITORY, TOKEN_REPOSITORY, USER_REPOSITORY } from 'src/common/config/common.const';
import { ProfileRepository } from 'src/user/infrastructure/repository/profile.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import { TokenRepository } from 'src/auth/infrastructure/repository/token.repository';

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
