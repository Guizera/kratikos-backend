import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const { postId, content, parentId } = createCommentDto;

    // Verificar se post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }

    // Criar comentário
    const comment = this.commentRepository.create({
      postId,
      userId,
      content,
      parentId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Incrementar contador de comentários no post
    await this.postRepository.increment({ id: postId }, 'commentsCount', 1);

    // Recarregar com user
    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { postId, parentId: null }, // Apenas comentários principais
      relations: ['user', 'replies', 'replies.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comentário não encontrado');
    }

    // Apenas o autor pode deletar
    if (comment.userId !== userId) {
      throw new NotFoundException('Você não tem permissão para deletar este comentário');
    }

    await this.commentRepository.remove(comment);

    // Decrementar contador
    await this.postRepository.decrement({ id: comment.postId }, 'commentsCount', 1);
  }
}

