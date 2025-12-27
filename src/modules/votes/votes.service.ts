import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostVote, VoteType } from './entities/post-vote.entity';
import { Post } from '../posts/entities/post.entity';
import { CreateVoteDto, SkipVoteDto } from './dto/create-vote.dto';

@Injectable()
export class VotesService {
  private readonly logger = new Logger(VotesService.name);

  constructor(
    @InjectRepository(PostVote)
    private readonly voteRepository: Repository<PostVote>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  /**
   * Registra um voto (positivo ou negativo) em um post
   */
  async vote(createVoteDto: CreateVoteDto, userId: string): Promise<PostVote> {
    const { post_id, vote, device_fingerprint } = createVoteDto;

    // Verificar se o post existe
    const post = await this.postRepository.findOne({ where: { id: post_id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Verificar se o usuário já votou neste post
    const existingVote = await this.voteRepository.findOne({
      where: { userId, postId: post_id },
    });

    const voteType = vote ? VoteType.POSITIVE : VoteType.NEGATIVE;

    if (existingVote) {
      // Se já votou, atualizar o voto
      if (existingVote.voteType === voteType) {
        // Se votou na mesma direção, remover o voto (toggle)
        await this.voteRepository.remove(existingVote);
        this.logger.log(`✅ Voto removido: usuário ${userId} no post ${post_id}`);
        return existingVote;
      } else {
        // Se votou na direção oposta, atualizar
        existingVote.voteType = voteType;
        const updated = await this.voteRepository.save(existingVote);
        this.logger.log(`✅ Voto atualizado: usuário ${userId} no post ${post_id} - ${voteType}`);
        return updated;
      }
    }

    // Criar novo voto
    const newVote = this.voteRepository.create({
      userId,
      postId: post_id,
      voteType,
      deviceFingerprint: device_fingerprint ? JSON.stringify(device_fingerprint) : null,
    });

    const saved = await this.voteRepository.save(newVote);
    this.logger.log(`✅ Novo voto registrado: usuário ${userId} no post ${post_id} - ${voteType}`);
    return saved;
  }

  /**
   * Registra um skip (pular) em um post
   */
  async skip(skipVoteDto: SkipVoteDto, userId: string): Promise<PostVote> {
    const { post_id, device_fingerprint } = skipVoteDto;

    // Verificar se o post existe
    const post = await this.postRepository.findOne({ where: { id: post_id } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Verificar se já pulou este post
    const existingSkip = await this.voteRepository.findOne({
      where: { userId, postId: post_id, voteType: VoteType.SKIP },
    });

    if (existingSkip) {
      throw new BadRequestException('Você já pulou este post');
    }

    // Criar skip
    const skip = this.voteRepository.create({
      userId,
      postId: post_id,
      voteType: VoteType.SKIP,
      deviceFingerprint: device_fingerprint ? JSON.stringify(device_fingerprint) : null,
    });

    const saved = await this.voteRepository.save(skip);
    this.logger.log(`✅ Skip registrado: usuário ${userId} no post ${post_id}`);
    return saved;
  }

  /**
   * Obtém o voto do usuário em um post
   */
  async getUserVote(postId: string, userId: string): Promise<PostVote | null> {
    return this.voteRepository.findOne({
      where: { userId, postId },
    });
  }

  /**
   * Obtém estatísticas de votos de um post
   */
  async getPostVoteStats(postId: string): Promise<{
    positiveCount: number;
    negativeCount: number;
    skipCount: number;
    total: number;
  }> {
    const votes = await this.voteRepository.find({ where: { postId } });

    const stats = {
      positiveCount: votes.filter(v => v.voteType === VoteType.POSITIVE).length,
      negativeCount: votes.filter(v => v.voteType === VoteType.NEGATIVE).length,
      skipCount: votes.filter(v => v.voteType === VoteType.SKIP).length,
      total: votes.length,
    };

    return stats;
  }

  /**
   * Remove um voto
   */
  async removeVote(postId: string, userId: string): Promise<void> {
    const vote = await this.voteRepository.findOne({
      where: { userId, postId },
    });

    if (!vote) {
      throw new NotFoundException('Voto não encontrado');
    }

    await this.voteRepository.remove(vote);
    this.logger.log(`✅ Voto removido: usuário ${userId} no post ${postId}`);
  }
}

