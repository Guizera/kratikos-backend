import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { SimpleScoringService } from '../scoring/simple-scoring.service';

export enum LeaderboardType {
  VOTES = 'votes',
  STREAK = 'streak',
  WEIGHT = 'weight',
}

export enum LeaderboardPeriod {
  ALL_TIME = 'all_time',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  photoUrl: string | null;
  verificationLevel: number;
  value: number;
  position: number;
}

export interface LeaderboardResult {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  total: number;
  userPosition?: {
    position: number;
    value: number;
  };
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);
  private cache: Map<string, { data: LeaderboardResult; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 hora

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly scoringService: SimpleScoringService,
  ) {}

  /**
   * Obtém o leaderboard com cache
   */
  async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    limit: number = 100,
    userId?: string,
  ): Promise<LeaderboardResult> {
    const cacheKey = `${type}_${period}_${limit}`;
    const cached = this.cache.get(cacheKey);

    // Retornar do cache se ainda válido
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.log(`📊 Leaderboard retornado do cache: ${cacheKey}`);
      
      // Se userId fornecido, adicionar posição do usuário
      if (userId) {
        const userPosition = await this.getUserPosition(type, period, userId);
        return {
          ...cached.data,
          userPosition,
        };
      }
      
      return cached.data;
    }

    // Calcular novo ranking
    this.logger.log(`🔄 Calculando leaderboard: ${cacheKey}`);
    const result = await this.calculateLeaderboard(type, period, limit, userId);

    // Salvar no cache
    this.cache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return result;
  }

  /**
   * Calcula o leaderboard baseado no tipo e período
   */
  private async calculateLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    limit: number,
    userId?: string,
  ): Promise<LeaderboardResult> {
    let entries: LeaderboardEntry[] = [];

    switch (type) {
      case LeaderboardType.VOTES:
        entries = await this.getVotesLeaderboard(period, limit);
        break;
      case LeaderboardType.STREAK:
        entries = await this.getStreakLeaderboard(limit);
        break;
      case LeaderboardType.WEIGHT:
        entries = await this.getWeightLeaderboard(limit);
        break;
    }

    const total = entries.length;
    
    // Adicionar posição do usuário se fornecido
    let userPosition;
    if (userId) {
      userPosition = await this.getUserPosition(type, period, userId);
    }

    return {
      type,
      period,
      entries,
      total,
      userPosition,
    };
  }

  /**
   * Ranking por total de votos
   */
  private async getVotesLeaderboard(
    period: LeaderboardPeriod,
    limit: number,
  ): Promise<LeaderboardEntry[]> {
    let query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id as userId',
        'user.name as name',
        'user.photo_url as photoUrl',
        'user.verification_level as verificationLevel',
      ]);

    if (period === LeaderboardPeriod.MONTHLY) {
      // Contar votos dos últimos 30 dias
      query = query
        .addSelect((subQuery) => {
          return subQuery
            .select('COUNT(*)')
            .from('poll_votes', 'pv')
            .where('pv.user_id = user.id')
            .andWhere("pv.created_at >= NOW() - INTERVAL '30 days'");
        }, 'value')
        .orderBy('value', 'DESC');
    } else if (period === LeaderboardPeriod.WEEKLY) {
      // Contar votos dos últimos 7 dias
      query = query
        .addSelect((subQuery) => {
          return subQuery
            .select('COUNT(*)')
            .from('poll_votes', 'pv')
            .where('pv.user_id = user.id')
            .andWhere("pv.created_at >= NOW() - INTERVAL '7 days'");
        }, 'value')
        .orderBy('value', 'DESC');
    } else {
      // All time - usar total_votes direto
      query = query
        .addSelect('user.total_votes', 'value')
        .orderBy('user.total_votes', 'DESC');
    }

    const results = await query.limit(limit).getRawMany();

    return results.map((row, index) => ({
      userId: row.userid,
      name: row.name,
      photoUrl: row.photourl,
      verificationLevel: row.verificationlevel,
      value: parseInt(row.value) || 0,
      position: index + 1,
    }));
  }

  /**
   * Ranking por streak (dias consecutivos)
   */
  private async getStreakLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    const results = await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id as userId',
        'user.name as name',
        'user.photo_url as photoUrl',
        'user.verification_level as verificationLevel',
        'user.consistent_voting_days as value',
      ])
      .orderBy('user.consistent_voting_days', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((row, index) => ({
      userId: row.userid,
      name: row.name,
      photoUrl: row.photourl,
      verificationLevel: row.verificationlevel,
      value: parseInt(row.value) || 0,
      position: index + 1,
    }));
  }

  /**
   * Ranking por peso (weight/score)
   */
  private async getWeightLeaderboard(limit: number): Promise<LeaderboardEntry[]> {
    // Buscar todos os usuários e calcular score
    const users = await this.userRepository.find({
      order: { totalVotes: 'DESC' },
      take: limit * 2, // Pegar mais para garantir que temos top após calcular
    });

    // Calcular score para cada um
    const usersWithScore = await Promise.all(
      users.map(async (user) => {
        const score = await this.scoringService.calculateUserScore(user.id);
        return {
          userId: user.id,
          name: user.name,
          photoUrl: user.photoUrl,
          verificationLevel: user.verificationLevel,
          value: score.weight,
        };
      }),
    );

    // Ordenar por peso e pegar top limit
    usersWithScore.sort((a, b) => b.value - a.value);
    const topUsers = usersWithScore.slice(0, limit);

    return topUsers.map((user, index) => ({
      ...user,
      position: index + 1,
    }));
  }

  /**
   * Obtém a posição específica de um usuário
   */
  private async getUserPosition(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    userId: string,
  ): Promise<{ position: number; value: number }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      return { position: 0, value: 0 };
    }

    let value = 0;
    let position = 0;

    switch (type) {
      case LeaderboardType.VOTES:
        if (period === LeaderboardPeriod.MONTHLY) {
          const result = await this.userRepository.query(
            `SELECT COUNT(*)::int as votes
             FROM poll_votes
             WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`,
            [userId],
          );
          value = result[0]?.votes || 0;
          
          const posResult = await this.userRepository.query(
            `SELECT COUNT(DISTINCT pv.user_id)::int + 1 as position
             FROM poll_votes pv
             WHERE pv.created_at >= NOW() - INTERVAL '30 days'
             GROUP BY pv.user_id
             HAVING COUNT(*) > $1`,
            [value],
          );
          position = posResult[0]?.position || 1;
        } else if (period === LeaderboardPeriod.WEEKLY) {
          const result = await this.userRepository.query(
            `SELECT COUNT(*)::int as votes
             FROM poll_votes
             WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
            [userId],
          );
          value = result[0]?.votes || 0;
          
          const posResult = await this.userRepository.query(
            `SELECT COUNT(DISTINCT pv.user_id)::int + 1 as position
             FROM poll_votes pv
             WHERE pv.created_at >= NOW() - INTERVAL '7 days'
             GROUP BY pv.user_id
             HAVING COUNT(*) > $1`,
            [value],
          );
          position = posResult[0]?.position || 1;
        } else {
          value = user.totalVotes;
          const posResult = await this.userRepository.query(
            `SELECT COUNT(*)::int + 1 as position
             FROM users
             WHERE total_votes > $1`,
            [value],
          );
          position = posResult[0]?.position || 1;
        }
        break;

      case LeaderboardType.STREAK:
        value = user.consistentVotingDays;
        const streakPosResult = await this.userRepository.query(
          `SELECT COUNT(*)::int + 1 as position
           FROM users
           WHERE consistent_voting_days > $1`,
          [value],
        );
        position = streakPosResult[0]?.position || 1;
        break;

      case LeaderboardType.WEIGHT:
        const score = await this.scoringService.calculateUserScore(userId);
        value = score.weight;
        
        // Para peso, precisamos calcular todos e contar (não é eficiente, mas funciona)
        const allUsers = await this.userRepository.find({
          select: ['id', 'totalVotes'],
          order: { totalVotes: 'DESC' },
          take: 1000, // Limitar para não explodir
        });
        
        const usersWithWeight = await Promise.all(
          allUsers.map(async (u) => {
            const s = await this.scoringService.calculateUserScore(u.id);
            return { id: u.id, weight: s.weight };
          }),
        );
        
        usersWithWeight.sort((a, b) => b.weight - a.weight);
        position = usersWithWeight.findIndex((u) => u.id === userId) + 1;
        break;
    }

    return { position, value };
  }

  /**
   * Limpa o cache manualmente (útil para testes)
   */
  clearCache(): void {
    this.cache.clear();
    this.logger.log('🗑️ Cache do leaderboard limpo');
  }
}
