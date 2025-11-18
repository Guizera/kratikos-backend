import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { NewsSyncService } from './services/news-sync.service';
import { ShareNewsDto } from './dto/share-news.dto';
import { NewsScope } from './entities/news-article.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly newsSyncService: NewsSyncService,
  ) {}

  // ========================================================================
  // ENDPOINTS POR SCOPE
  // ========================================================================

  @Get('international')
  @ApiOperation({ summary: 'Buscar notícias internacionais' })
  @ApiQuery({ name: 'category', required: false, example: 'technology' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notícias internacionais retornadas' })
  async getInternationalNews(
    @Query('category') category?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.newsService.getInternationalNews(category, page, limit);
  }

  @Get('national')
  @ApiOperation({ summary: 'Buscar notícias nacionais' })
  @ApiQuery({ name: 'category', required: false, example: 'politics' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notícias nacionais retornadas' })
  async getNationalNews(
    @Query('category') category?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.newsService.getNationalNews(category, page, limit);
  }

  @Get('regional')
  @ApiOperation({ summary: 'Buscar notícias regionais por localização' })
  @ApiQuery({ name: 'lat', required: true, type: Number })
  @ApiQuery({ name: 'lng', required: true, type: Number })
  @ApiQuery({ name: 'range', required: false, type: Number, description: 'Range em KM' })
  @ApiQuery({ name: 'category', required: false, example: 'local' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notícias regionais retornadas' })
  async getRegionalNews(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('range', new DefaultValuePipe(50), ParseIntPipe) range?: number,
    @Query('category') category?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Latitude e longitude devem ser números válidos');
    }

    return this.newsService.getRegionalNews(latitude, longitude, range, category, page, limit);
  }

  // ========================================================================
  // BUSCAR NOTÍCIA POR ID
  // ========================================================================

  @Get(':id')
  @ApiOperation({ summary: 'Buscar notícia por ID' })
  @ApiResponse({ status: 200, description: 'Notícia encontrada' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.newsService.findOne(id);
  }

  // ========================================================================
  // BUSCA (FULL-TEXT SEARCH)
  // ========================================================================

  @Get('search/query')
  @ApiOperation({ summary: 'Buscar notícias por texto' })
  @ApiQuery({ name: 'q', required: true, description: 'Termo de busca' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Resultados da busca' })
  async searchNews(
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const articles = await this.newsService.search(query, limit);
    return { news: articles };
  }

  // ========================================================================
  // INTERAÇÕES: LIKES
  // ========================================================================

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Curtir uma notícia' })
  @ApiResponse({ status: 200, description: 'Notícia curtida com sucesso' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  @ApiResponse({ status: 400, description: 'Você já curtiu esta notícia' })
  async likeNews(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.newsService.likeNews(id, req.user.userId);
    return { message: 'Notícia curtida com sucesso' };
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remover curtida de uma notícia' })
  @ApiResponse({ status: 200, description: 'Curtida removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Curtida não encontrada' })
  async unlikeNews(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.newsService.unlikeNews(id, req.user.userId);
    return { message: 'Curtida removida com sucesso' };
  }

  @Get(':id/liked')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar se usuário curtiu a notícia' })
  @ApiResponse({ status: 200, description: 'Status de curtida retornado' })
  async hasLiked(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    const hasLiked = await this.newsService.hasUserLikedNews(id, req.user.userId);
    return { hasLiked };
  }

  // ========================================================================
  // INTERAÇÕES: SHARES
  // ========================================================================

  @Post(':id/share')
  @ApiOperation({ summary: 'Compartilhar uma notícia' })
  @ApiResponse({ status: 200, description: 'Notícia compartilhada com sucesso' })
  @ApiResponse({ status: 404, description: 'Notícia não encontrada' })
  async shareNews(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() shareDto: ShareNewsDto,
    @Request() req,
  ) {
    const userId = req.user?.userId || null;
    await this.newsService.shareNews(id, userId, shareDto.platform);
    return { message: 'Notícia compartilhada com sucesso' };
  }

  // ========================================================================
  // SINCRONIZAÇÃO MANUAL (para desenvolvimento/testes)
  // ========================================================================

  @Get('sync/health')
  @ApiOperation({ summary: 'Verificar configuração da sincronização de notícias' })
  @ApiResponse({ status: 200, description: 'Status da configuração' })
  async checkSyncHealth() {
    return this.newsSyncService.getHealthStatus();
  }

  @Post('sync/force')
  @ApiOperation({ summary: 'Forçar sincronização de notícias (desenvolvimento)' })
  @ApiResponse({ status: 200, description: 'Sincronização iniciada' })
  async forceSyncNews() {
    // Executar sincronização em background
    this.newsSyncService.forceSyncAll().catch(err => {
      console.error('Erro na sincronização forçada:', err);
    });
    
    return { 
      message: 'Sincronização iniciada! As notícias serão carregadas em alguns segundos.',
      tip: 'Use GET /news/stats/summary para ver o progresso'
    };
  }

  // ========================================================================
  // ESTATÍSTICAS
  // ========================================================================

  @Get('stats/summary')
  @ApiOperation({ summary: 'Obter estatísticas de notícias' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas' })
  async getStats() {
    return this.newsService.getStats();
  }
}

