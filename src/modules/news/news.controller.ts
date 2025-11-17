import { Controller, Get, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';
import { NewsScope } from './entities/news-article.entity';

@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Endpoints antigos (compatibilidade)
  @Get('international')
  @ApiOperation({ summary: 'Buscar notícias internacionais (legado)' })
  async getInternationalNews(@Query() query: NewsQueryDto) {
    const categories = query.categories.split(',').map((c) => c.trim());
    return this.newsService.getInternationalNews(
      categories,
      query.page,
      query.limit,
    );
  }

  @Get('national')
  @ApiOperation({ summary: 'Buscar notícias nacionais (legado)' })
  async getNationalNews(@Query() query: NewsQueryDto) {
    const categories = query.categories.split(',').map((c) => c.trim());
    return this.newsService.getNationalNews(
      categories,
      query.region || null,
      query.page,
      query.limit,
    );
  }

  // Novos endpoints com scope
  @Get()
  @ApiOperation({ summary: 'Buscar notícias por scope' })
  @ApiQuery({ name: 'scope', enum: NewsScope, description: 'Escopo das notícias' })
  @ApiQuery({ name: 'categories', required: false, example: 'politics,economy' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'range', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Notícias retornadas com sucesso' })
  async getNewsByScope(
    @Query('scope') scope: NewsScope,
    @Query('categories') categories: string = 'general',
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('range', new DefaultValuePipe(50), ParseIntPipe) range?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const categoryList = categories.split(',').map((c) => c.trim());

    switch (scope) {
      case NewsScope.INTERNACIONAL:
        return this.newsService.getInternationalNews(categoryList, page, limit);
      
      case NewsScope.NACIONAL:
        return this.newsService.getNationalNews(categoryList, null, page, limit);
      
      case NewsScope.REGIONAL:
        if (!lat || !lng) {
          return { articles: [] };
        }
        // TODO: Implementar busca regional de notícias
        return { articles: [] };
      
      default:
        return this.newsService.getInternationalNews(categoryList, page, limit);
    }
  }
}

