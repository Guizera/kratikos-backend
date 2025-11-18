import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsArticle, NewsScope } from './entities/news-article.entity';
import { NewsLike } from './entities/news-like.entity';
import { NewsShare } from './entities/news-share.entity';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsRepository: Repository<NewsArticle>,
    @InjectRepository(NewsLike)
    private readonly newsLikeRepository: Repository<NewsLike>,
    @InjectRepository(NewsShare)
    private readonly newsShareRepository: Repository<NewsShare>,
  ) {}

  // ========================================================================
  // BUSCA POR SCOPE
  // ========================================================================

  async getInternationalNews(
    category?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ articles: NewsArticle[]; total: number; page: number; limit: number }> {
    this.logger.log(`🌍 Buscando notícias internacionais: category=${category}, page=${page}`);

    const query = this.newsRepository
      .createQueryBuilder('news')
      .where('news.scope = :scope', { scope: NewsScope.INTERNACIONAL })
      .andWhere('news.is_active = true');

    if (category) {
      query.andWhere('news.category = :category', { category });
    }

    const [articles, total] = await query
      .orderBy('news.published_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { articles, total, page, limit };
  }

  async getNationalNews(
    category?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ articles: NewsArticle[]; total: number; page: number; limit: number }> {
    this.logger.log(`🇧🇷 Buscando notícias nacionais: category=${category}, page=${page}`);

    const query = this.newsRepository
      .createQueryBuilder('news')
      .where('news.scope = :scope', { scope: NewsScope.NACIONAL })
      .andWhere('news.is_active = true');

    if (category) {
      query.andWhere('news.category = :category', { category });
    }

    const [articles, total] = await query
      .orderBy('news.published_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { articles, total, page, limit };
  }

  async getRegionalNews(
    lat: number,
    lng: number,
    rangeKm: number = 50,
    category?: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ articles: NewsArticle[]; total: number; page: number; limit: number }> {
    this.logger.log(`📍 Buscando notícias regionais: lat=${lat}, lng=${lng}, range=${rangeKm}km`);

    const skip = (page - 1) * limit;

    // Query com Haversine para calcular distância
    let query = `
      SELECT * FROM (
        SELECT 
          n.*,
          (6371 * acos(
            cos(radians($1)) * cos(radians(n.location_lat)) *
            cos(radians(n.location_lng) - radians($2)) +
            sin(radians($1)) * sin(radians(n.location_lat))
          )) AS distance
        FROM news_articles n
        WHERE n.scope = 'regional'
          AND n.is_active = true
          AND n.location_lat IS NOT NULL
          AND n.location_lng IS NOT NULL
    `;

    const params: any[] = [lat, lng, rangeKm];
    let paramIndex = 4;

    if (category) {
      query += ` AND n.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    query += `
      ) AS news_with_distance
      WHERE distance <= $3
      ORDER BY published_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, skip);

    const articles = await this.newsRepository.query(query, params);

    // Buscar total
    let countQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT 
          n.*,
          (6371 * acos(
            cos(radians($1)) * cos(radians(n.location_lat)) *
            cos(radians(n.location_lng) - radians($2)) +
            sin(radians($1)) * sin(radians(n.location_lat))
          )) AS distance
        FROM news_articles n
        WHERE n.scope = 'regional'
          AND n.is_active = true
          AND n.location_lat IS NOT NULL
          AND n.location_lng IS NOT NULL
    `;

    const countParams: any[] = [lat, lng, rangeKm];
    let countParamIndex = 4;

    if (category) {
      countQuery += ` AND n.category = $${countParamIndex}`;
      countParams.push(category);
    }

    countQuery += `
      ) AS subquery
      WHERE distance <= $3
    `;

    const [{ total }] = await this.newsRepository.query(countQuery, countParams);

    return {
      articles,
      total: parseInt(total),
      page,
      limit,
    };
  }

  // ========================================================================
  // BUSCA POR ID
  // ========================================================================

  async findOne(id: string): Promise<NewsArticle> {
    const news = await this.newsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!news) {
      throw new NotFoundException('Notícia não encontrada');
    }

    // Incrementar contador de visualizações
    await this.newsRepository.increment({ id }, 'viewsCount', 1);

    return news;
  }

  // ========================================================================
  // FULL-TEXT SEARCH
  // ========================================================================

  async search(query: string, limit: number = 20): Promise<NewsArticle[]> {
    this.logger.log(`🔍 Buscando notícias: "${query}"`);

    return this.newsRepository
      .createQueryBuilder('news')
      .where(
        "to_tsvector('portuguese', news.title || ' ' || COALESCE(news.description, '') || ' ' || COALESCE(news.content, '')) @@ plainto_tsquery('portuguese', :query)",
        { query },
      )
      .andWhere('news.is_active = true')
      .orderBy('news.published_at', 'DESC')
      .limit(limit)
      .getMany();
  }

  // ========================================================================
  // INTERAÇÕES: LIKES
  // ========================================================================

  async likeNews(newsId: string, userId: string): Promise<void> {
    const news = await this.newsRepository.findOne({ where: { id: newsId } });
    if (!news) {
      throw new NotFoundException('Notícia não encontrada');
    }

    const existingLike = await this.newsLikeRepository.findOne({
      where: { newsId, userId },
    });

    if (existingLike) {
      throw new BadRequestException('Você já curtiu esta notícia');
    }

    const like = this.newsLikeRepository.create({ newsId, userId });
    await this.newsLikeRepository.save(like);
    await this.newsRepository.increment({ id: newsId }, 'likesCount', 1);

    this.logger.debug(`👍 Usuário ${userId} curtiu notícia ${newsId}`);
  }

  async unlikeNews(newsId: string, userId: string): Promise<void> {
    const like = await this.newsLikeRepository.findOne({
      where: { newsId, userId },
    });

    if (!like) {
      throw new NotFoundException('Curtida não encontrada');
    }

    await this.newsLikeRepository.remove(like);
    await this.newsRepository.decrement({ id: newsId }, 'likesCount', 1);

    this.logger.debug(`👎 Usuário ${userId} removeu curtida da notícia ${newsId}`);
  }

  async hasUserLikedNews(newsId: string, userId: string): Promise<boolean> {
    const like = await this.newsLikeRepository.findOne({
      where: { newsId, userId },
    });
    return !!like;
  }

  // ========================================================================
  // INTERAÇÕES: SHARES
  // ========================================================================

  async shareNews(newsId: string, userId: string | null, platform?: string): Promise<void> {
    const news = await this.newsRepository.findOne({ where: { id: newsId } });
    if (!news) {
      throw new NotFoundException('Notícia não encontrada');
    }

    const share = this.newsShareRepository.create({
      newsId,
      userId,
      platform: platform || 'link',
    });

    await this.newsShareRepository.save(share);
    await this.newsRepository.increment({ id: newsId }, 'sharesCount', 1);

    this.logger.debug(`📤 Notícia ${newsId} compartilhada via ${platform || 'link'}`);
  }

  // ========================================================================
  // ESTATÍSTICAS
  // ========================================================================

  async getStats(): Promise<{
    total: number;
    internacional: number;
    nacional: number;
    regional: number;
    totalLikes: number;
    totalShares: number;
  }> {
    const [total, internacional, nacional, regional] = await Promise.all([
      this.newsRepository.count({ where: { isActive: true } }),
      this.newsRepository.count({ where: { scope: NewsScope.INTERNACIONAL, isActive: true } }),
      this.newsRepository.count({ where: { scope: NewsScope.NACIONAL, isActive: true } }),
      this.newsRepository.count({ where: { scope: NewsScope.REGIONAL, isActive: true } }),
    ]);

    const likesCount = await this.newsLikeRepository.count();
    const sharesCount = await this.newsShareRepository.count();

    return {
      total,
      internacional,
      nacional,
      regional,
      totalLikes: likesCount,
      totalShares: sharesCount,
    };
  }
}
