import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsComment, NewsCommentType } from '../entities/news-comment.entity';
import { NewsCommentPollOption } from '../entities/news-comment-poll-option.entity';
import { NewsCommentPollVote } from '../entities/news-comment-poll-vote.entity';
import { NewsCommentLike } from '../entities/news-comment-like.entity';
import { NewsArticle } from '../entities/news-article.entity';
import { CreateNewsCommentDto } from '../dto/create-news-comment.dto';

@Injectable()
export class NewsCommentsService {
  private readonly logger = new Logger(NewsCommentsService.name);

  constructor(
    @InjectRepository(NewsComment)
    private readonly commentRepository: Repository<NewsComment>,
    @InjectRepository(NewsCommentPollOption)
    private readonly pollOptionRepository: Repository<NewsCommentPollOption>,
    @InjectRepository(NewsCommentPollVote)
    private readonly pollVoteRepository: Repository<NewsCommentPollVote>,
    @InjectRepository(NewsCommentLike)
    private readonly commentLikeRepository: Repository<NewsCommentLike>,
    @InjectRepository(NewsArticle)
    private readonly newsRepository: Repository<NewsArticle>,
  ) {}

  // ========================================================================
  // CRIAR COMENTÁRIO
  // ========================================================================

  async create(
    newsId: string,
    userId: string,
    createCommentDto: CreateNewsCommentDto,
  ): Promise<NewsComment> {
    // Verificar se a notícia existe
    const news = await this.newsRepository.findOne({ where: { id: newsId } });
    if (!news) {
      throw new NotFoundException('Notícia não encontrada');
    }

    // Validar: se é poll, deve ter opções
    if (createCommentDto.commentType === NewsCommentType.POLL) {
      if (!createCommentDto.pollOptions || createCommentDto.pollOptions.length < 2) {
        throw new BadRequestException('Sub-enquete deve ter no mínimo 2 opções');
      }
    }

    // Criar comentário
    const comment = this.commentRepository.create({
      newsId,
      userId,
      content: createCommentDto.content,
      commentType: createCommentDto.commentType || NewsCommentType.TEXT,
      parentCommentId: createCommentDto.parentCommentId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Se for poll, criar opções
    if (createCommentDto.commentType === NewsCommentType.POLL && createCommentDto.pollOptions) {
      const options = createCommentDto.pollOptions.map((opt, index) =>
        this.pollOptionRepository.create({
          commentId: savedComment.id,
          optionText: opt.optionText,
          displayOrder: opt.displayOrder ?? index,
        }),
      );
      await this.pollOptionRepository.save(options);
    }

    this.logger.log(`Comentário criado: ${savedComment.id} na notícia ${newsId}`);

    // Recarregar com relações
    return this.findOne(savedComment.id);
  }

  // ========================================================================
  // BUSCAR COMENTÁRIOS
  // ========================================================================

  async findByNews(
    newsId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ comments: NewsComment[]; total: number }> {
    const [comments, total] = await this.commentRepository.findAndCount({
      where: { newsId, parentCommentId: null }, // Apenas comentários raiz
      relations: ['user', 'pollOptions', 'replies', 'replies.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { comments, total };
  }

  async findOne(id: string): Promise<NewsComment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user', 'pollOptions', 'replies', 'replies.user'],
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    return comment;
  }

  async findReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ replies: NewsComment[]; total: number }> {
    const [replies, total] = await this.commentRepository.findAndCount({
      where: { parentCommentId: commentId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { replies, total };
  }

  // ========================================================================
  // DELETAR COMENTÁRIO
  // ========================================================================

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Apenas o autor pode deletar
    if (comment.userId !== userId) {
      throw new ForbiddenException('Você não pode deletar este comentário');
    }

    await this.commentRepository.remove(comment);
    this.logger.log(`Comentário deletado: ${id}`);
  }

  // ========================================================================
  // CURTIR COMENTÁRIO
  // ========================================================================

  async likeComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId } });
    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    const existingLike = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });

    if (existingLike) {
      throw new BadRequestException('Você já curtiu este comentário');
    }

    const like = this.commentLikeRepository.create({ commentId, userId });
    await this.commentLikeRepository.save(like);
    await this.commentRepository.increment({ id: commentId }, 'likesCount', 1);

    this.logger.debug(`👍 Usuário ${userId} curtiu comentário ${commentId}`);
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    const like = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });

    if (!like) {
      throw new NotFoundException('Curtida não encontrada');
    }

    await this.commentLikeRepository.remove(like);
    await this.commentRepository.decrement({ id: commentId }, 'likesCount', 1);

    this.logger.debug(`👎 Usuário ${userId} removeu curtida do comentário ${commentId}`);
  }

  async hasUserLikedComment(commentId: string, userId: string): Promise<boolean> {
    const like = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });
    return !!like;
  }

  // ========================================================================
  // VOTAR EM SUB-ENQUETE
  // ========================================================================

  async voteInPoll(optionId: string, userId: string): Promise<void> {
    const option = await this.pollOptionRepository.findOne({
      where: { id: optionId },
      relations: ['comment'],
    });

    if (!option) {
      throw new NotFoundException('Opção de voto não encontrada');
    }

    // Verificar se é uma sub-enquete
    if (option.comment.commentType !== NewsCommentType.POLL) {
      throw new BadRequestException('Este comentário não é uma sub-enquete');
    }

    // Verificar se já votou em alguma opção desta sub-enquete
    const allOptions = await this.pollOptionRepository.find({
      where: { commentId: option.commentId },
    });

    for (const opt of allOptions) {
      const existingVote = await this.pollVoteRepository.findOne({
        where: { optionId: opt.id, userId },
      });

      if (existingVote) {
        throw new BadRequestException('Você já votou nesta sub-enquete');
      }
    }

    // Registrar voto
    const vote = this.pollVoteRepository.create({ optionId, userId });
    await this.pollVoteRepository.save(vote);

    this.logger.debug(`✅ Usuário ${userId} votou na opção ${optionId}`);
  }

  async removeVoteFromPoll(optionId: string, userId: string): Promise<void> {
    const vote = await this.pollVoteRepository.findOne({
      where: { optionId, userId },
    });

    if (!vote) {
      throw new NotFoundException('Voto não encontrado');
    }

    await this.pollVoteRepository.remove(vote);
    this.logger.debug(`❌ Usuário ${userId} removeu voto da opção ${optionId}`);
  }

  async getUserVoteInPoll(commentId: string, userId: string): Promise<string | null> {
    const options = await this.pollOptionRepository.find({
      where: { commentId },
    });

    for (const option of options) {
      const vote = await this.pollVoteRepository.findOne({
        where: { optionId: option.id, userId },
      });

      if (vote) {
        return option.id;
      }
    }

    return null;
  }

  // ========================================================================
  // ESTATÍSTICAS
  // ========================================================================

  async getStats(newsId: string): Promise<{
    totalComments: number;
    totalPolls: number;
    totalLikes: number;
  }> {
    const totalComments = await this.commentRepository.count({ where: { newsId } });
    const totalPolls = await this.commentRepository.count({
      where: { newsId, commentType: NewsCommentType.POLL },
    });
    const likesCount = await this.commentLikeRepository
      .createQueryBuilder('like')
      .innerJoin('like.comment', 'comment')
      .where('comment.news_id = :newsId', { newsId })
      .getCount();

    return {
      totalComments,
      totalPolls,
      totalLikes: likesCount,
    };
  }
}

