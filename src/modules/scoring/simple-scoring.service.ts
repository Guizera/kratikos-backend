import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

export interface UserScore {
  baseScore: number;           // 0-1
  verificationBonus: number;   // 0-1
  historyScore: number;        // 0-1
  consistencyScore: number;    // 0-1
  finalScore: number;          // 0-1
  weight: number;              // 0.5-2.0
}

@Injectable()
export class SimpleScoringService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Calcula score simplificado do usuário
   * NÃO usa engines complexos, apenas métricas básicas do banco
   */
  async calculateUserScore(userId: string): Promise<UserScore> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'verificationLevel',
        'createdAt',
        'totalVotes',
        'consistentVotingDays',
        'lastVoteAt',
      ],
    });
    
    if (!user) {
      return this.getDefaultScore();
    }
    
    // 1. Score base = 1.0 (todos começam iguais)
    const baseScore = 1.0;
    
    // 2. Bônus de verificação (0-0.5)
    const verificationBonus = this.calculateVerificationBonus(
      user.verificationLevel,
    );
    
    // 3. Score de histórico (0-1)
    const historyScore = this.calculateHistoryScore(
      user.createdAt,
      user.totalVotes || 0,
    );
    
    // 4. Score de consistência (0-1)
    const consistencyScore = this.calculateConsistencyScore(
      user.consistentVotingDays || 0,
      user.lastVoteAt,
    );
    
    // 5. Score final (média ponderada)
    const finalScore = (
      baseScore * 0.4 +
      verificationBonus * 0.3 +
      historyScore * 0.2 +
      consistencyScore * 0.1
    );
    
    // 6. Converter score para peso (0.5x - 2.0x)
    const weight = this.scoreToWeight(finalScore, user.verificationLevel);
    
    return {
      baseScore,
      verificationBonus,
      historyScore,
      consistencyScore,
      finalScore,
      weight,
    };
  }

  /**
   * Bônus baseado em nível de verificação
   */
  private calculateVerificationBonus(verificationLevel: number): number {
    switch (verificationLevel) {
      case 1: return 0;      // Básica: sem bônus
      case 2: return 0.3;    // Verificada: +30%
      case 3: return 0.5;    // Legal: +50%
      default: return 0;
    }
  }

  /**
   * Score baseado em idade da conta e total de votos
   */
  private calculateHistoryScore(
    createdAt: Date,
    totalVotes: number,
  ): number {
    // Idade da conta em dias
    const accountAge = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    
    // Score de idade (0-0.5)
    // Conta nova (0 dias) = 0
    // Conta antiga (730+ dias) = 0.5
    const ageScore = Math.min(0.5, accountAge / 730); // 2 anos = max
    
    // Score de participação (0-0.5)
    // 0 votos = 0
    // 200+ votos = 0.5
    const participationScore = Math.min(0.5, totalVotes / 200);
    
    return ageScore + participationScore;
  }

  /**
   * Score baseado em consistência de votação
   */
  private calculateConsistencyScore(
    consistentDays: number,
    lastVoteAt: Date | null,
  ): number {
    if (!lastVoteAt) return 0.5; // Neutro para usuários sem histórico
    
    // Dias desde último voto
    const daysSinceLastVote = Math.floor(
      (Date.now() - lastVoteAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    
    // Penalizar inatividade
    let activityScore = 1.0;
    if (daysSinceLastVote > 7) {
      activityScore = 0.7; // -30% se inativo > 7 dias
    }
    if (daysSinceLastVote > 30) {
      activityScore = 0.5; // -50% se inativo > 30 dias
    }
    
    // Bônus de consistência
    // 14+ dias consecutivos = 1.0
    // 0 dias = 0.5
    const consistencyBonus = Math.min(1.0, 0.5 + (consistentDays / 14));
    
    return (activityScore + consistencyBonus) / 2;
  }

  /**
   * Converte score (0-1) em peso (0.5-2.0)
   */
  private scoreToWeight(score: number, verificationLevel: number): number {
    // Multiplicador baseado em nível
    let multiplier = 1.0;
    if (verificationLevel === 2) multiplier = 1.5;  // Verificada: até 1.5x
    if (verificationLevel === 3) multiplier = 2.0;  // Legal: até 2.0x
    
    const weight = 0.5 + (score * multiplier);
    
    // Limites: 0.5x (mínimo) a 2.0x (máximo)
    return Math.max(0.5, Math.min(2.0, weight));
  }

  /**
   * Score padrão para usuários novos
   */
  private getDefaultScore(): UserScore {
    return {
      baseScore: 1.0,
      verificationBonus: 0,
      historyScore: 0,
      consistencyScore: 0.5,
      finalScore: 0.7,
      weight: 1.0,
    };
  }

  /**
   * Atualiza estatísticas do usuário após voto
   */
  async updateUserStats(userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    
    if (!user) return;
    
    const now = new Date();
    
    // Incrementar total de votos
    user.totalVotes = (user.totalVotes || 0) + 1;
    
    // Verificar consistência (votou ontem?)
    if (user.lastVoteAt) {
      const lastVoteDate = new Date(user.lastVoteAt);
      lastVoteDate.setHours(0, 0, 0, 0);
      
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor(
        (today.getTime() - lastVoteDate.getTime()) / (1000 * 60 * 60 * 24),
      );
      
      if (daysDiff === 1) {
        // Votou ontem: incrementar streak
        user.consistentVotingDays = (user.consistentVotingDays || 0) + 1;
      } else if (daysDiff > 1) {
        // Quebrou o streak
        user.consistentVotingDays = 1;
      }
      // Se daysDiff === 0 (votou hoje novamente), não altera streak
    } else {
      user.consistentVotingDays = 1;
    }
    
    user.lastVoteAt = now;
    
    await this.userRepository.save(user);
  }
}
