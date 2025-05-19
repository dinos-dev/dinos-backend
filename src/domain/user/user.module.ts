import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repository/user.repository';
import { UserProfile } from './entities/user-profile.entity';
import { UserProfileRepository } from './repository/user-profile.repository';
import { AvatarRepository } from './repository/avatar.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserProfileRepository, AvatarRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
