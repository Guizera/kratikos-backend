import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimpleScoringService } from './simple-scoring.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [SimpleScoringService],
  exports: [SimpleScoringService],
})
export class ScoringModule {}
