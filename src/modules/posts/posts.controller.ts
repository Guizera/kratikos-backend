import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards, 
  Request,
  ParseUUIDPipe,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('posts')
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('feed')
  @ApiOperation({ summary: 'Listar posts do feed' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts retornada com sucesso',
  })
  async getFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findAll(page, limit);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo post' })
  @ApiResponse({ 
    status: 201, 
    description: 'Post criado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.userId);
  }

  @Get('posts/remaining')
  @ApiOperation({ summary: 'Obter número de posts restantes' })
  @ApiResponse({ 
    status: 200, 
    description: 'Número de posts restantes retornado',
    schema: {
      type: 'object',
      properties: {
        remaining: { type: 'number', example: 5 },
      },
    },
  })
  async getRemainingPosts() {
    // TODO: Implementar lógica de limite de posts por usuário/período
    // Por enquanto, retornar valor fixo (sem autenticação necessária)
    return { remaining: 5 };
  }

  @Get('posts')
  @ApiOperation({ summary: 'Listar todos os posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts retornada com sucesso',
  })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findAll(page, limit);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Buscar post por ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post encontrado',
  })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.findOne(id);
  }

  @Patch('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar post' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post atualizado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete('posts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletar post' })
  @ApiResponse({ 
    status: 200, 
    description: 'Post deletado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.postsService.remove(id);
    return { message: 'Post deletado com sucesso' };
  }

  @Get('posts/author/:authorId')
  @ApiOperation({ summary: 'Listar posts de um autor' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts do autor retornada com sucesso',
  })
  async findByAuthor(
    @Param('authorId', ParseUUIDPipe) authorId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findByAuthor(authorId, page, limit);
  }

  @Get('posts/category/:categoryId')
  @ApiOperation({ summary: 'Listar posts de uma categoria' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts da categoria retornada com sucesso',
  })
  async findByCategory(
    @Param('categoryId', ParseUUIDPipe) categoryId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findByCategory(categoryId, page, limit);
  }
}

