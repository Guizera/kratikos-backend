import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsArticle, NewsScope } from '../entities/news-article.entity';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NewsSyncService {
  private readonly logger = new Logger(NewsSyncService.name);
  private readonly newsApiKey: string;
  private readonly newsApiBaseUrl = 'https://newsapi.org/v2';

  constructor(
    @InjectRepository(NewsArticle)
    private readonly newsRepository: Repository<NewsArticle>,
    private readonly configService: ConfigService,
  ) {
    this.newsApiKey = this.configService.get<string>('NEWS_API_KEY') || '';
    if (!this.newsApiKey) {
      this.logger.warn('⚠️ NEWS_API_KEY não configurada! Sincronização de notícias desabilitada.');
    }
  }

  /**
   * Sincroniza notícias internacionais a cada 30 minutos
   */
  @Cron('0 */30 * * * *')
  async syncInternationalNews() {
    if (!this.newsApiKey) return;

    this.logger.log('🌍 Sincronizando notícias internacionais...');
    
    try {
      const categories = ['technology', 'business', 'science', 'health'];
      const countries = ['us', 'gb']; // EUA e Reino Unido
      
      for (const country of countries) {
        for (const category of categories) {
          const articles = await this.fetchFromNewsAPI(
            country,
            category,
            NewsScope.INTERNACIONAL,
          );
          await this.saveArticles(articles);
        }
      }
      
      this.logger.log('✅ Notícias internacionais sincronizadas!');
    } catch (error) {
      this.logger.error('❌ Erro ao sincronizar notícias internacionais', error.message);
    }
  }

  /**
   * Sincroniza notícias nacionais a cada 20 minutos
   */
  @Cron('0 */20 * * * *')
  async syncNationalNews() {
    if (!this.newsApiKey) return;

    this.logger.log('🇧🇷 Sincronizando notícias nacionais...');
    
    try {
      const categories = ['general', 'business', 'technology', 'health', 'science', 'sports'];
      
      for (const category of categories) {
        const articles = await this.fetchFromNewsAPI(
          'br',
          category,
          NewsScope.NACIONAL,
        );
        await this.saveArticles(articles);
      }
      
      this.logger.log('✅ Notícias nacionais sincronizadas!');
    } catch (error) {
      this.logger.error('❌ Erro ao sincronizar notícias nacionais', error.message);
    }
  }

  /**
   * Busca notícias da NewsAPI
   */
  private async fetchFromNewsAPI(
    country: string,
    category: string,
    scope: NewsScope,
  ): Promise<Partial<NewsArticle>[]> {
    try {
      const url = `${this.newsApiBaseUrl}/top-headlines`;
      
      const response = await axios.get(url, {
        params: {
          country,
          category,
          apiKey: this.newsApiKey,
          pageSize: 20,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'ok') {
        this.logger.warn(`⚠️ NewsAPI retornou status: ${response.data.status}`);
        return [];
      }

      const articles = response.data.articles || [];
      
      return articles
        .filter((article: any) => article.title && article.url) // Filtrar inválidos
        .map((article: any) => ({
          externalId: article.url, // Usar URL como ID único
          title: this.sanitize(article.title),
          description: this.sanitize(article.description),
          content: this.sanitize(article.content),
          imageUrl: article.urlToImage,
          sourceName: article.source?.name || 'Desconhecido',
          sourceUrl: article.url,
          author: article.author,
          category: category,
          scope: scope,
          publishedAt: new Date(article.publishedAt || Date.now()),
          locationCountry: country === 'br' ? 'Brasil' : undefined,
          language: country === 'br' ? 'pt' : 'en',
          tags: this.extractTags(article.title + ' ' + (article.description || '')),
          isActive: true,
        }));
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        this.logger.warn(`⏱️ Timeout ao buscar notícias de ${country}/${category}`);
      } else if (error.response?.status === 429) {
        this.logger.warn('🚫 Limite de requisições da NewsAPI atingido');
      } else {
        this.logger.error(`❌ Erro ao buscar notícias: ${error.message}`);
      }
      return [];
    }
  }

  /**
   * Salva artigos no banco de dados
   */
  private async saveArticles(articles: Partial<NewsArticle>[]) {
    for (const articleData of articles) {
      try {
        // Verificar se já existe (por external_id e source_url)
        const existing = await this.newsRepository.findOne({
          where: {
            externalId: articleData.externalId,
            sourceUrl: articleData.sourceUrl,
          },
        });

        if (existing) {
          // Atualizar timestamp, mas manter conteúdo original
          await this.newsRepository.update(existing.id, {
            updatedAt: new Date(),
          });
          this.logger.debug(`🔄 Notícia já existe: ${articleData.title?.substring(0, 50)}...`);
        } else {
          // Criar nova notícia
          const newsArticle = this.newsRepository.create(articleData);
          await this.newsRepository.save(newsArticle);
          this.logger.debug(`📰 Nova notícia salva: ${articleData.title?.substring(0, 50)}...`);
        }
      } catch (error) {
        // Erro de duplicata ou constraint (ignorar silenciosamente)
        if (error.code === '23505') {
          // Constraint unique violado (notícia duplicada)
          continue;
        }
        this.logger.warn(`⚠️ Erro ao salvar notícia: ${error.message}`);
      }
    }
  }

  /**
   * Extrai tags/palavras-chave do texto
   */
  private extractTags(text: string): string[] {
    if (!text) return [];
    
    const words = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .split(/\W+/)
      .filter(w => w.length > 4); // Palavras com mais de 4 letras
    
    // Remover duplicatas e limitar a 10 tags
    return [...new Set(words)].slice(0, 10);
  }

  /**
   * Sanitiza texto removendo caracteres especiais
   */
  private sanitize(text: string | null): string {
    if (!text) return '';
    return text
      .replace(/\[.*?\]/g, '') // Remove [+123 chars] e similares
      .trim();
  }

  /**
   * Limpa notícias antigas (mais de 30 dias)
   * Roda todo dia às 3h da manhã
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanOldNews() {
    this.logger.log('🧹 Limpando notícias antigas...');
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await this.newsRepository
        .createQueryBuilder()
        .delete()
        .where('published_at < :date', { date: thirtyDaysAgo })
        .andWhere('views_count < 10') // Manter notícias populares
        .andWhere('likes_count < 5')  // Manter notícias curtidas
        .execute();

      this.logger.log(`🗑️ ${result.affected} notícias antigas removidas`);
    } catch (error) {
      this.logger.error('❌ Erro ao limpar notícias antigas', error.message);
    }
  }

  /**
   * Método manual para forçar sincronização (útil para testes)
   */
  async forceSyncAll() {
    this.logger.log('🔄 Forçando sincronização completa de notícias...');
    await Promise.all([
      this.syncInternationalNews(),
      this.syncNationalNews(),
    ]);
    this.logger.log('✅ Sincronização completa finalizada!');
  }
}

