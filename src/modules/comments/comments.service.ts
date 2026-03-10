import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment, CommentType } from './entities/comment.entity';
import { CommentPollOption } from './entities/comment-poll-option.entity';
import { CommentPollVote } from './entities/comment-poll-vote.entity';
import { CommentLike } from './entities/comment-like.entity';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(CommentPollOption)
    private readonly pollOptionRepository: Repository<CommentPollOption>,
    @InjectRepository(CommentPollVote)
    private readonly pollVoteRepository: Repository<CommentPollVote>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepository: Repository<CommentLike>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ========================================================================
  // CRIAR COMENTÁRIO
  // ========================================================================

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const { postId, content, parentId, commentType, pollOptions } = createCommentDto;

    // Validar userId
    if (!userId) {
      this.logger.error('❌ Tentativa de criar comentário sem userId');
      throw new BadRequestException('Usuário não autenticado');
    }

    // Verificar se post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Verificar se usuário existe
    const user = await this.commentRepository.manager.findOne(User, { where: { id: userId } });
    if (!user) {
      this.logger.error(`❌ Tentativa de criar comentário com userId inválido: ${userId}`);
      throw new BadRequestException('Usuário não encontrado');
    }

    // Validar: se é poll, deve ter opções
    if (commentType === CommentType.POLL) {
      if (!pollOptions || pollOptions.length < 2) {
        throw new BadRequestException('Sub-enquete deve ter no mínimo 2 opções');
      }
    }

    // Criar comentário
    const comment = this.commentRepository.create({
      postId,
      userId,
      content,
      commentType: commentType || CommentType.TEXT,
      parentId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Se for poll, criar opções
    if (commentType === CommentType.POLL && pollOptions) {
      const options = pollOptions.map((opt, index) =>
        this.pollOptionRepository.create({
          commentId: savedComment.id,
          optionText: opt.optionText,
          displayOrder: opt.displayOrder ?? index,
        }),
      );
      await this.pollOptionRepository.save(options);
    }

    // Incrementar contador de comentários no post
    await this.postRepository.increment({ id: postId }, 'commentsCount', 1);

    this.logger.log(`Comentário criado: ${savedComment.id} no post ${postId}`);

    // Criar notificação
    if (parentId) {
      // É uma resposta a outro comentário
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentId },
      });
      if (parentComment) {
        await this.notificationsService.create({
          recipientId: parentComment.userId,
          senderId: userId,
          type: NotificationType.REPLY_TO_COMMENT,
          postId,
          commentId: savedComment.id,
          content: content?.substring(0, 100),
        });
      }
    } else {
      // É um comentário direto no post
      await this.notificationsService.create({
        recipientId: post.authorId,
        senderId: userId,
        type: NotificationType.COMMENT_ON_POST,
        postId,
        commentId: savedComment.id,
        content: content?.substring(0, 100),
      });
    }

    // Recarregar com relações usando query builder para garantir que user seja carregado
    const commentWithUser = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.pollOptions', 'pollOptions')
      .where('comment.id = :id', { id: savedComment.id })
      .getOne();

    if (!commentWithUser) {
      this.logger.error(`Comentário ${savedComment.id} não encontrado após criação`);
      throw new NotFoundException('Erro ao criar comentário');
    }

    if (!commentWithUser.user) {
      this.logger.error(`❌ Usuário não carregado para comentário ${savedComment.id}, userId: ${userId}`);
      
      // Tentar buscar o usuário diretamente
      const user = await this.commentRepository.manager.findOne(User, { where: { id: userId } });
      if (!user) {
        this.logger.error(`❌ Usuário ${userId} não existe no banco de dados`);
      } else {
        this.logger.log(`✅ Usuário ${userId} existe: ${user.name || user.email}`);
      }
    } else {
      this.logger.log(`✅ Comentário criado com usuário: ${commentWithUser.user.name}`);
    }

    return commentWithUser;
  }

  // ========================================================================
  // BUSCAR COMENTÁRIOS
  // ========================================================================

  async findByPostId(
    postId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ comments: Comment[]; total: number }> {
    this.logger.log(`📥 Buscando comentários do post ${postId} (page: ${page}, limit: ${limit})`);
    
    // Usar query builder para garantir que user seja carregado
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.pollOptions', 'pollOptions')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'repliesUser')
      .where('comment.postId = :postId', { postId })
      .andWhere('comment.parentId IS NULL') // Apenas comentários raiz
      .orderBy('comment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [comments, total] = await queryBuilder.getManyAndCount();

    this.logger.log(`📊 Encontrados ${comments.length} comentários (total: ${total})`);
    
    // Log detalhado de cada comentário
    comments.forEach((comment, index) => {
      if (comment.user) {
        this.logger.log(`  ✅ Comentário ${index + 1}: user carregado - ${comment.user.name} (${comment.user.id})`);
      } else {
        this.logger.error(`  ❌ Comentário ${index + 1}: user é NULL - userId: ${comment.userId}`);
        
        // Verificar se o userId existe na tabela users
        this.commentRepository.manager.findOne(User, { where: { id: comment.userId } })
          .then(user => {
            if (user) {
              this.logger.error(`    ⚠️ Usuário ${comment.userId} EXISTE no banco: ${user.name}, mas não foi carregado pelo join!`);
            } else {
              this.logger.error(`    ⚠️ Usuário ${comment.userId} NÃO EXISTE no banco!`);
            }
          });
      }
    });

    return { comments, total };
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .leftJoinAndSelect('comment.pollOptions', 'pollOptions')
      .leftJoinAndSelect('comment.replies', 'replies')
      .leftJoinAndSelect('replies.user', 'repliesUser')
      .where('comment.id = :id', { id })
      .getOne();

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    return comment;
  }

  async findReplies(
    commentId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ replies: Comment[]; total: number }> {
    const queryBuilder = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.user', 'user')
      .where('comment.parentId = :commentId', { commentId })
      .orderBy('comment.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [replies, total] = await queryBuilder.getManyAndCount();

    return { replies, total };
  }

  // ========================================================================
  // DELETAR COMENTÁRIO
  // ========================================================================

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Apenas o autor pode deletar
    if (comment.userId !== userId) {
      throw new ForbiddenException('Você não tem permissão para deletar este comentário');
    }

    await this.commentRepository.remove(comment);

    // Decrementar contador
    await this.postRepository.decrement({ id: comment.postId }, 'commentsCount', 1);

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

    this.logger.debug(`👍 Usuário ${userId} curtiu comentário ${commentId}`);

    // Criar notificação para o autor do comentário
    await this.notificationsService.create({
      recipientId: comment.userId,
      senderId: userId,
      type: NotificationType.COMMENT_LIKE,
      commentId,
      postId: comment.postId,
    });
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    const like = await this.commentLikeRepository.findOne({
      where: { commentId, userId },
    });

    if (!like) {
      throw new NotFoundException('Curtida não encontrada');
    }

    await this.commentLikeRepository.remove(like);
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
    if (option.comment.commentType !== CommentType.POLL) {
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

  async getStats(postId: string): Promise<{
    totalComments: number;
    totalPolls: number;
    totalLikes: number;
  }> {
    const totalComments = await this.commentRepository.count({ where: { postId } });
    const totalPolls = await this.commentRepository.count({
      where: { postId, commentType: CommentType.POLL },
    });
    const likesCount = await this.commentLikeRepository
      .createQueryBuilder('like')
      .innerJoin('like.comment', 'comment')
      .where('comment.post_id = :postId', { postId })
      .getCount();

    return {
      totalComments,
      totalPolls,
      totalLikes: likesCount,
    };
  }
}
