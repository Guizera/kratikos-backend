import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';
import { ScoringModule } from '../scoring/scoring.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Follow]),
    ScoringModule,
    forwardRef(() => NotificationsModule),
  ],
  controllers: [UsersController, FollowsController],
  providers: [UsersService, FollowsService],
  exports: [UsersService, FollowsService],
})
export class UsersModule {}
