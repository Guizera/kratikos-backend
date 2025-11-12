import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { User } from './entities/user.entity';
import { Follow } from './entities/follow.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow])],
  controllers: [UsersController, FollowsController],
  providers: [UsersService, FollowsService],
  exports: [UsersService, FollowsService], // Exportando para uso em outros módulos
})
export class UsersModule {}
