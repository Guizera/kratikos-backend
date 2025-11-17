import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar comentário' }}
  @ApiResponse({ status: 201, description: 'Comentário criado com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.create(createCommentDto, req.user.userId);
  }

  @Get('post/:postId')
  @ApiOperation({ summary: 'Listar comentários de um post' }}
  @ApiResponse({ status: 200, description: 'Lista de comentários retornada com sucesso' })
  async findByPost(@Param('postId', ParseUUIDPipe) postId: string) {
    return this.commentsService.findByPostId(postId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar comentário' }}
  @ApiResponse({ status: 200, description: 'Comentário deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Comentário não encontrado' }}
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.commentsService.delete(id, req.user.userId);
    return { message: 'Comentário deletado com sucesso' };
  }
}

