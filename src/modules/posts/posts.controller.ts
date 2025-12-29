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
  HttpCode,
  HttpStatus,
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

  // ========================================================================
  // ENDPOINTS POR SCOPE (devem vir ANTES de /posts/:id)
  // ========================================================================

  @Get('posts/international')
  @ApiOperation({ summary: 'Listar posts internacionais' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts internacionais retornada com sucesso',
  })
  async findInternational(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findInternationalPosts(page, limit);
  }

  @Get('posts/national')
  @ApiOperation({ summary: 'Listar posts nacionais' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts nacionais retornada com sucesso',
  })
  async findNational(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postsService.findNationalPosts(page, limit);
  }

  @Get('posts/regional')
  @ApiOperation({ summary: 'Listar posts regionais por localização' })
  @ApiQuery({ name: 'lat', required: true, type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', required: true, type: Number, description: 'Longitude' })
  @ApiQuery({ name: 'range', required: false, type: Number, description: 'Range em KM (padrão: 50)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista de posts regionais retornada com sucesso',
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Latitude e longitude são obrigatórias',
  })
  async findRegional(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('range', new DefaultValuePipe(50), ParseIntPipe) range: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Latitude e longitude devem ser números válidos');
    }
    
    return this.postsService.findRegionalPosts(latitude, longitude, range, page, limit);
  }

  // ========================================================================
  // ROTAS COM PARÂMETROS DINÂMICOS (devem vir DEPOIS das rotas específicas)
  // ========================================================================

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

  // ========================================================================
  // LIKES
  // ========================================================================

  @Post('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Curtir um post' })
  @ApiResponse({ status: 200, description: 'Post curtido com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  @ApiResponse({ status: 400, description: 'Você já curtiu este post' })
  async likePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.postsService.likePost(id, req.user.userId);
    return { message: 'Post curtido com sucesso' };
  }

  @Delete('posts/:id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover curtida de um post' })
  @ApiResponse({ status: 200, description: 'Curtida removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Like não encontrado' })
  async unlikePost(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    await this.postsService.unlikePost(id, req.user.userId);
    return { message: 'Curtida removida com sucesso' };
  }

  @Get('posts/:id/liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar se usuário curtiu o post' })
  @ApiResponse({ status: 200, description: 'Status de curtida retornado' })
  async hasLiked(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req,
  ) {
    const hasLiked = await this.postsService.hasUserLikedPost(id, req.user.userId);
    return { hasLiked };
  }

  // ========================================================================
  // SHARES
  // ========================================================================

  @Post('posts/:id/share')
  @ApiOperation({ summary: 'Compartilhar um post' })
  @ApiResponse({ status: 200, description: 'Post compartilhado com sucesso' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async sharePost(@Param('id', ParseUUIDPipe) id: string) {
    await this.postsService.sharePost(id);
    return { message: 'Post compartilhado com sucesso' };
  }

  // ========================================================================
  // SALVAR POSTS
  // ========================================================================

  @Post('posts/:id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Salvar um post' })
  @ApiResponse({ status: 201, description: 'Post salvo com sucesso' })
  @ApiResponse({ status: 400, description: 'Post já está salvo' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async savePost(
    @Param('id', ParseUUIDPipe) postId: string,
    @Request() req,
  ) {
    await this.postsService.savePost(postId, req.user.userId);
    return { message: 'Post salvo com sucesso' };
  }

  @Delete('posts/:id/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover post dos salvos' })
  @ApiResponse({ status: 204, description: 'Post removido dos salvos' })
  @ApiResponse({ status: 404, description: 'Post não está salvo' })
  async unsavePost(
    @Param('id', ParseUUIDPipe) postId: string,
    @Request() req,
  ) {
    await this.postsService.unsavePost(postId, req.user.userId);
  }

  @Get('posts/:id/saved')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar se usuário salvou o post' })
  @ApiResponse({ status: 200, description: 'Status retornado' })
  async hasUserSavedPost(
    @Param('id', ParseUUIDPipe) postId: string,
    @Request() req,
  ) {
    const saved = await this.postsService.hasUserSavedPost(postId, req.user.userId);
    return { saved };
  }

  @Get('posts/saved/list')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar posts salvos do usuário' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Lista de posts salvos' })
  async getSavedPosts(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.postsService.getSavedPosts(req.user.userId, page, limit);
  }
}

