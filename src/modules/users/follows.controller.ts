import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('follows')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':userId/follow')
  @ApiOperation({ summary: 'Seguir um usuário' })
  @ApiResponse({ status: 201, description: 'Usuário seguido com sucesso' })
  @ApiResponse({ status: 400, description: 'Já está seguindo ou tentando seguir a si mesmo' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async followUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: any,
  ) {
    const followerId = req.user.userId;
    await this.followsService.followUser(followerId, userId);
    return { message: 'Usuário seguido com sucesso' };
  }

  @Delete(':userId/follow')
  @ApiOperation({ summary: 'Deixar de seguir um usuário' })
  @ApiResponse({ status: 200, description: 'Deixou de seguir com sucesso' })
  @ApiResponse({ status: 404, description: 'Não está seguindo este usuário' })
  async unfollowUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: any,
  ) {
    const followerId = req.user.userId;
    await this.followsService.unfollowUser(followerId, userId);
    return { message: 'Deixou de seguir com sucesso' };
  }

  @Get(':userId/is-following')
  @ApiOperation({ summary: 'Verificar se está seguindo um usuário' })
  @ApiResponse({ status: 200, description: 'Status de follow retornado' })
  async isFollowing(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: any,
  ) {
    const followerId = req.user.userId;
    const isFollowing = await this.followsService.isFollowing(followerId, userId);
    return { isFollowing };
  }

  @Get(':userId/followers')
  @ApiOperation({ summary: 'Obter lista de seguidores de um usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de seguidores retornada' })
  async getFollowers(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.followsService.getFollowers(userId, page, limit);
  }

  @Get(':userId/following')
  @ApiOperation({ summary: 'Obter lista de usuários que um usuário está seguindo' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de seguindo retornada' })
  async getFollowing(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.followsService.getFollowing(userId, page, limit);
  }

  @Get(':userId/follow-counts')
  @ApiOperation({ summary: 'Obter contadores de seguidores e seguindo' })
  @ApiResponse({
    status: 200,
    description: 'Contadores retornados',
    schema: {
      type: 'object',
      properties: {
        followers: { type: 'number' },
        following: { type: 'number' },
      },
    },
  })
  async getFollowCounts(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.followsService.getFollowCounts(userId);
  }
}

