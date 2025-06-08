import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './repository/user.repository';
import { PROFILE_REPOSITORY, USER_REPOSITORY } from 'src/core/config/common.const';
import { ProfileRepository } from './repository/profile.repository';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

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
    PrismaService,
  ],
  exports: [UserService, USER_REPOSITORY],
})
export class UserModule {}
