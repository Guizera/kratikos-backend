import {
  Controller,
  Get,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('search')
@Controller('search')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('all')
  @ApiOperation({ summary: 'Buscar em tudo (usuários, posts e enquetes)' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de resultados por categoria', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Resultados da busca retornados com sucesso',
    schema: {
      type: 'object',
      properties: {
        users: { type: 'array' },
        posts: { type: 'array' },
        polls: { type: 'array' },
        total: { type: 'number' },
      },
    },
  })
  async searchAll(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.searchService.searchAll(query, limit);
  }

  @Get('users')
  @ApiOperation({ summary: 'Buscar usuários' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de resultados', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Usuários encontrados',
    schema: {
      type: 'object',
      properties: {
        users: { type: 'array' },
        total: { type: 'number' },
      },
    },
  })
  async searchUsers(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const users = await this.searchService.searchUsers(query, limit);
    return { users, total: users.length };
  }

  @Get('posts')
  @ApiOperation({ summary: 'Buscar posts' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de resultados', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Posts encontrados',
    schema: {
      type: 'object',
      properties: {
        posts: { type: 'array' },
        total: { type: 'number' },
      },
    },
  })
  async searchPosts(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const posts = await this.searchService.searchPosts(query, limit);
    return { posts, total: posts.length };
  }

  @Get('polls')
  @ApiOperation({ summary: 'Buscar enquetes' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de resultados', example: 20 })
  @ApiResponse({
    status: 200,
    description: 'Enquetes encontradas',
    schema: {
      type: 'object',
      properties: {
        polls: { type: 'array' },
        total: { type: 'number' },
      },
    },
  })
  async searchPolls(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const polls = await this.searchService.searchPolls(query, limit);
    return { polls, total: polls.length };
  }

  @Get('suggestions/users')
  @ApiOperation({ summary: 'Obter usuários sugeridos' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de resultados', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Usuários sugeridos retornados',
  })
  async getSuggestedUsers(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const users = await this.searchService.getSuggestedUsers(limit);
    return { users, total: users.length };
  }

  @Get('trending/posts')
  @ApiOperation({ summary: 'Obter posts em alta (trending)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limite de resultados', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Posts em alta retornados',
  })
  async getTrendingPosts(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const posts = await this.searchService.getTrendingPosts(limit);
    return { posts, total: posts.length };
  }
}

