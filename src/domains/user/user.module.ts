import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserProfile } from './entities/user-profile.entity';
import { UserProfileRepository } from './repositories/user-profile.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile])],
  controllers: [UserController],
  providers: [UserService, UserRepository, UserProfileRepository],
  exports: [UserService, UserRepository],
})
export class UserModule {}
