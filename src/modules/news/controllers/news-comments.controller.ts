import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NewsCommentsService } from '../services/news-comments.service';
import { CreateNewsCommentDto } from '../dto/create-news-comment.dto';
import { NewsComment } from '../entities/news-comment.entity';

@ApiTags('News Comments')
@Controller('news')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NewsCommentsController {
  constructor(private readonly commentsService: NewsCommentsService) {}

  // ========================================================================
  // COMENTÁRIOS
  // ========================================================================

  @Post(':id/comments')
  @ApiOperation({ summary: 'Criar comentário ou sub-enquete em uma notícia' })
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  async createComment(
    @Param('id') newsId: string,
    @Body() createCommentDto: CreateNewsCommentDto,
    @Request() req,
  ): Promise<NewsComment> {
    return this.commentsService.create(newsId, req.user.userId, createCommentDto);
  }

  @Get(':id/comments')
  @ApiOperation({ summary: 'Listar comentários de uma notícia' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de comentários' })
  async getComments(
    @Param('id') newsId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ comments: NewsComment[]; total: number }> {
    return this.commentsService.findByNews(newsId, page || 1, limit || 20);
  }

  @Get('comments/:id')
  @ApiOperation({ summary: 'Buscar um comentário específico' })
  @ApiResponse({ status: 200, description: 'Comentário encontrado' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  async getComment(@Param('id') id: string): Promise<NewsComment> {
    return this.commentsService.findOne(id);
  }

  @Get('comments/:id/replies')
  @ApiOperation({ summary: 'Listar respostas de um comentário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de respostas' })
  async getReplies(
    @Param('id') commentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<{ replies: NewsComment[]; total: number }> {
    return this.commentsService.findReplies(commentId, page || 1, limit || 10);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar um comentário' })
  @ApiResponse({ status: 204, description: 'Comentário deletado com sucesso' })
  @ApiResponse({ status: 403, description: 'Você não pode deletar este comentário' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  async deleteComment(@Param('id') id: string, @Request() req): Promise<void> {
    await this.commentsService.remove(id, req.user.userId);
  }

  // ========================================================================
  // CURTIDAS EM COMENTÁRIOS
  // ========================================================================

  @Post('comments/:id/like')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Curtir um comentário' })
  @ApiResponse({ status: 201, description: 'Comentário curtido com sucesso' })
  @ApiResponse({ status: 400, description: 'Você já curtiu este comentário' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' })
  async likeComment(@Param('id') commentId: string, @Request() req): Promise<{ message: string }> {
    await this.commentsService.likeComment(commentId, req.user.userId);
    return { message: 'Comentário curtido com sucesso' };
  }

  @Delete('comments/:id/like')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover curtida de um comentário' })
  @ApiResponse({ status: 204, description: 'Curtida removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Curtida não encontrada' })
  async unlikeComment(@Param('id') commentId: string, @Request() req): Promise<void> {
    await this.commentsService.unlikeComment(commentId, req.user.userId);
  }

  @Get('comments/:id/liked')
  @ApiOperation({ summary: 'Verificar se usuário curtiu o comentário' })
  @ApiResponse({ status: 200, description: 'Status da curtida' })
  async hasLikedComment(
    @Param('id') commentId: string,
    @Request() req,
  ): Promise<{ liked: boolean }> {
    const liked = await this.commentsService.hasUserLikedComment(commentId, req.user.userId);
    return { liked };
  }

  // ========================================================================
  // SUB-ENQUETES (VOTAÇÃO)
  // ========================================================================

  @Post('comments/poll/options/:optionId/vote')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Votar em uma opção de sub-enquete' })
  @ApiResponse({ status: 201, description: 'Voto registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Você já votou nesta sub-enquete' })
  @ApiResponse({ status: 404, description: 'Opção não encontrada' })
  async voteInPoll(
    @Param('optionId') optionId: string,
    @Request() req,
  ): Promise<{ message: string }> {
    await this.commentsService.voteInPoll(optionId, req.user.userId);
    return { message: 'Voto registrado com sucesso' };
  }

  @Delete('comments/poll/options/:optionId/vote')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover voto de uma sub-enquete' })
  @ApiResponse({ status: 204, description: 'Voto removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Voto não encontrado' })
  async removeVoteFromPoll(@Param('optionId') optionId: string, @Request() req): Promise<void> {
    await this.commentsService.removeVoteFromPoll(optionId, req.user.userId);
  }

  @Get('comments/:id/poll/my-vote')
  @ApiOperation({ summary: 'Buscar voto do usuário em uma sub-enquete' })
  @ApiResponse({ status: 200, description: 'ID da opção votada ou null' })
  async getMyVoteInPoll(
    @Param('id') commentId: string,
    @Request() req,
  ): Promise<{ optionId: string | null }> {
    const optionId = await this.commentsService.getUserVoteInPoll(commentId, req.user.userId);
    return { optionId };
  }

  // ========================================================================
  // ESTATÍSTICAS
  // ========================================================================

  @Get(':id/comments/stats')
  @ApiOperation({ summary: 'Estatísticas de comentários de uma notícia' })
  @ApiResponse({ status: 200, description: 'Estatísticas dos comentários' })
  async getCommentStats(
    @Param('id') newsId: string,
  ): Promise<{
    totalComments: number;
    totalPolls: number;
    totalLikes: number;
  }> {
    return this.commentsService.getStats(newsId);
  }
}

