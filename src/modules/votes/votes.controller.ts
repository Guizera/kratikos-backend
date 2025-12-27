import {
  Controller,
  Post,
  Delete,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { CreateVoteDto, SkipVoteDto } from './dto/create-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('votes')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Votar em um post (positivo ou negativo)' })
  @ApiResponse({ status: 201, description: 'Voto registrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async vote(@Body() createVoteDto: CreateVoteDto, @Request() req) {
    const vote = await this.votesService.vote(createVoteDto, req.user.userId);
    return {
      message: 'Voto registrado com sucesso',
      vote: {
        id: vote.id,
        postId: vote.postId,
        voteType: vote.voteType,
        createdAt: vote.createdAt,
      },
    };
  }

  @Post('skip')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pular um post' })
  @ApiResponse({ status: 201, description: 'Skip registrado com sucesso' })
  @ApiResponse({ status: 400, description: 'Post já foi pulado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async skip(@Body() skipVoteDto: SkipVoteDto, @Request() req) {
    const skip = await this.votesService.skip(skipVoteDto, req.user.userId);
    return {
      message: 'Post pulado com sucesso',
      skip: {
        id: skip.id,
        postId: skip.postId,
        createdAt: skip.createdAt,
      },
    };
  }

  @Get('post/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter voto do usuário em um post' })
  @ApiResponse({ status: 200, description: 'Voto retornado' })
  async getUserVote(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Request() req,
  ) {
    const vote = await this.votesService.getUserVote(postId, req.user.userId);
    return {
      vote: vote ? {
        id: vote.id,
        postId: vote.postId,
        voteType: vote.voteType,
        createdAt: vote.createdAt,
      } : null,
    };
  }

  @Get('post/:postId/stats')
  @ApiOperation({ summary: 'Obter estatísticas de votos de um post' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas' })
  async getPostVoteStats(@Param('postId', ParseUUIDPipe) postId: string) {
    const stats = await this.votesService.getPostVoteStats(postId);
    return { stats };
  }

  @Delete('post/:postId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover voto de um post' })
  @ApiResponse({ status: 200, description: 'Voto removido' })
  @ApiResponse({ status: 404, description: 'Voto não encontrado' })
  async removeVote(
    @Param('postId', ParseUUIDPipe) postId: string,
    @Request() req,
  ) {
    await this.votesService.removeVote(postId, req.user.userId);
    return { message: 'Voto removido com sucesso' };
  }
}

