import { Controller, Get, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsQueryDto } from './dto/news-query.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('international')
  async getInternationalNews(@Query() query: NewsQueryDto) {
    const categories = query.categories.split(',').map((c) => c.trim());
    return this.newsService.getInternationalNews(
      categories,
      query.page,
      query.limit,
    );
  }

  @Get('national')
  async getNationalNews(@Query() query: NewsQueryDto) {
    const categories = query.categories.split(',').map((c) => c.trim());
    return this.newsService.getNationalNews(
      categories,
      query.region || null,
      query.page,
      query.limit,
    );
  }
}

