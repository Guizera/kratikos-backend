import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  LeaderboardService,
  LeaderboardType,
  LeaderboardPeriod,
} from './leaderboard.service';

@ApiTags('leaderboard')
@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get(':type')
  @ApiOperation({ summary: 'Obter ranking de usuários' })
  @ApiParam({
    name: 'type',
    enum: ['votes', 'streak', 'weight'],
    description: 'Tipo de ranking: votes (total de votos), streak (dias consecutivos), weight (peso/score)',
  })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['all_time', 'monthly', 'weekly'],
    description: 'Período: all_time (desde sempre), monthly (30 dias), weekly (7 dias)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade de usuários no ranking (padrão: 100)',
  })
  @ApiResponse({
    status: 200,
    description: 'Ranking retornado com sucesso',
    schema: {
      type: 'object',
      properties: {
        type: { type: 'string', example: 'votes' },
        period: { type: 'string', example: 'all_time' },
        total: { type: 'number', example: 100 },
        entries: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              userId: { type: 'string' },
              name: { type: 'string' },
              photoUrl: { type: 'string', nullable: true },
              verificationLevel: { type: 'number' },
              value: { type: 'number', description: 'Votos, dias ou peso dependendo do tipo' },
              position: { type: 'number' },
            },
          },
        },
        userPosition: {
          type: 'object',
          nullable: true,
          properties: {
            position: { type: 'number' },
            value: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Tipo ou período inválido' })
  async getLeaderboard(
    @Request() req,
    @Param('type') type: string,
    @Query('period', new DefaultValuePipe('all_time')) period: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    // Validar tipo
    if (!Object.values(LeaderboardType).includes(type as LeaderboardType)) {
      throw new BadRequestException(
        `Tipo inválido. Use: ${Object.values(LeaderboardType).join(', ')}`,
      );
    }

    // Validar período
    if (!Object.values(LeaderboardPeriod).includes(period as LeaderboardPeriod)) {
      throw new BadRequestException(
        `Período inválido. Use: ${Object.values(LeaderboardPeriod).join(', ')}`,
      );
    }

    // Limitar entre 10 e 500
    const safeLimit = Math.min(Math.max(limit, 10), 500);

    return await this.leaderboardService.getLeaderboard(
      type as LeaderboardType,
      period as LeaderboardPeriod,
      safeLimit,
      req.user.userId,
    );
  }
}
