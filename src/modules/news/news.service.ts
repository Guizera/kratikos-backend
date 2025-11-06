import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NewsArticle } from './entities/news-article.entity';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  private readonly openaiApiKey: string;
  private readonly openaiModel: string;

  constructor(private configService: ConfigService) {
    this.openaiApiKey = this.configService.get<string>('openai.apiKey') || '';
    // Usar gpt-3.5-turbo por padrão (mais rápido e barato)
    this.openaiModel = this.configService.get<string>('openai.model') || 'gpt-3.5-turbo';
    
    // Log para debug (remover depois)
    this.logger.log(`OpenAI API Key configurada: ${this.openaiApiKey ? 'SIM' : 'NÃO'}`);
    this.logger.log(`Modelo OpenAI: ${this.openaiModel}`);
  }

  async getInternationalNews(
    categories: string[],
    page: number = 1,
    limit: number = 20,
  ): Promise<{ articles: NewsArticle[] }> {
    this.logger.log(
      `Buscando notícias internacionais: categorias=${categories.join(',')}, page=${page}`,
    );

    try {
      // Gerar notícias usando OpenAI
      const articles = await this.generateNewsWithOpenAI(
        categories,
        true,
        null,
        limit,
      );

      return { articles };
    } catch (error) {
      this.logger.error(
        `Erro ao buscar notícias internacionais: ${error.message}`,
      );
      // Retorna dados mock em caso de erro
      return { articles: this.getMockInternationalNews(categories, limit) };
    }
  }

  async getNationalNews(
    categories: string[],
    region: string | null,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ articles: NewsArticle[] }> {
    this.logger.log(
      `Buscando notícias nacionais: categorias=${categories.join(',')}, região=${region}, page=${page}`,
    );

    try {
      // Gerar notícias usando OpenAI
      const articles = await this.generateNewsWithOpenAI(
        categories,
        false,
        region,
        limit,
      );

      return { articles };
    } catch (error) {
      this.logger.error(`Erro ao buscar notícias nacionais: ${error.message}`);
      // Retorna dados mock em caso de erro
      return { articles: this.getMockNationalNews(categories, region, limit) };
    }
  }

  private async generateNewsWithOpenAI(
    categories: string[],
    isInternational: boolean,
    region: string | null,
    limit: number,
  ): Promise<NewsArticle[]> {
    if (!this.openaiApiKey) {
      this.logger.warn('Chave da OpenAI não configurada, usando dados mock');
      return isInternational
        ? this.getMockInternationalNews(categories, limit)
        : this.getMockNationalNews(categories, region, limit);
    }

    const scope = isInternational ? 'internacional' : 'nacional do Brasil';
    const regionText = region ? ` na região ${region}` : '';
    
    // Limitar para no máximo 5 notícias por vez para resposta rápida
    const newsLimit = Math.min(limit, 5);

    const prompt = `Gere ${newsLimit} notícias ${scope}${regionText} sobre: ${categories.join(', ')}.

IMPORTANTE: Responda APENAS com JSON válido, sem markdown, sem explicações.

Formato:
[{
  "title": "título curto",
  "description": "1 frase resumida",
  "content": "2 parágrafos curtos",
  "source": "nome da fonte",
  "category": "${categories[0]}",
  "tags": ["tag1","tag2","tag3"]
}]`;

    try {
      this.logger.log(`Chamando OpenAI API com modelo: ${this.openaiModel}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: [
            {
              role: 'system',
              content: 'Você é um gerador de notícias. Responda APENAS com JSON válido, sem texto adicional.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1000, // Reduzido para 5 notícias rápidas
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        this.logger.error(`OpenAI API erro ${response.status}: ${JSON.stringify(errorData)}`);
        throw new Error(`OpenAI API retornou status ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        this.logger.error('Resposta vazia da OpenAI');
        throw new Error('Resposta vazia da OpenAI');
      }

      this.logger.log('OpenAI respondeu com sucesso, parseando JSON...');

      // Parse o JSON retornado
      let newsData;
      try {
        // Remover possíveis markdown tags (```json ... ```)
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanContent.startsWith('```')) {
          cleanContent = cleanContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }
        
        newsData = JSON.parse(cleanContent);
        this.logger.log(`Notícias geradas com sucesso: ${newsData.length} artigos`);
      } catch (parseError) {
        this.logger.error(`Erro ao parsear resposta da OpenAI: ${parseError.message}`);
        this.logger.error(`Conteúdo recebido: ${content.substring(0, 300)}...`);
        throw new Error('Erro ao parsear resposta da OpenAI');
      }

      // Transformar em NewsArticle
      return newsData.map((item: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: item.title,
        description: item.description,
        content: item.content,
        imageUrl: 'https://via.placeholder.com/800x400?text=Notícia',
        source: item.source,
        sourceUrl: '#',
        publishedAt: new Date(),
        category: item.category,
        tags: item.tags || [],
        isInternational,
        region: region || undefined,
      }));
    } catch (error) {
      this.logger.error(`Erro ao chamar OpenAI API: ${error.message}`);
      throw error;
    }
  }

  private getMockInternationalNews(
    categories: string[],
    limit: number,
  ): NewsArticle[] {
    const now = new Date();
    return [
      {
        id: '1',
        title: 'Acordo climático histórico é firmado na COP',
        description:
          'Líderes mundiais chegam a consenso sobre metas de redução de emissões.',
        content:
          'Em reunião histórica, os principais líderes mundiais concordaram em estabelecer metas mais ambiciosas para redução de emissões de gases de efeito estufa. O acordo prevê investimentos em energia renovável e mecanismos de fiscalização mais rigorosos.',
        imageUrl: 'https://via.placeholder.com/800x400?text=Clima',
        source: 'Global News',
        sourceUrl: '#',
        publishedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        category: 'environment',
        tags: ['clima', 'meio ambiente', 'política'],
        isInternational: true,
      },
      {
        id: '2',
        title: 'Novo avanço na inteligência artificial revoluciona medicina',
        description:
          'IA consegue diagnosticar doenças raras com 99% de precisão.',
        content:
          'Pesquisadores desenvolveram um sistema de inteligência artificial capaz de identificar doenças raras com precisão sem precedentes. A tecnologia promete revolucionar o diagnóstico médico e salvar milhares de vidas.',
        imageUrl: 'https://via.placeholder.com/800x400?text=IA+Medicina',
        source: 'Tech Today',
        sourceUrl: '#',
        publishedAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
        category: 'technology',
        tags: ['ia', 'medicina', 'tecnologia'],
        isInternational: true,
      },
      {
        id: '3',
        title: 'Mercados globais registram alta histórica',
        description:
          'Bolsas de valores ao redor do mundo celebram melhor dia do ano.',
        content:
          'As principais bolsas de valores globais registraram ganhos significativos hoje, impulsionadas por dados econômicos positivos e expectativas de crescimento sustentável.',
        imageUrl: 'https://via.placeholder.com/800x400?text=Economia',
        source: 'Financial Times',
        sourceUrl: '#',
        publishedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        category: 'economy',
        tags: ['economia', 'finanças', 'bolsa'],
        isInternational: true,
      },
    ].slice(0, limit);
  }

  private getMockNationalNews(
    categories: string[],
    region: string | null,
    limit: number,
  ): NewsArticle[] {
    const now = new Date();
    return [
      {
        id: '4',
        title: 'Governo anuncia novo programa de infraestrutura',
        description:
          'Investimentos de R$ 100 bilhões em rodovias e ferrovias.',
        content:
          'O governo federal anunciou hoje um amplo programa de investimentos em infraestrutura, com foco em modernização de rodovias e expansão da malha ferroviária. O projeto deve gerar milhares de empregos.',
        imageUrl: 'https://via.placeholder.com/800x400?text=Infraestrutura',
        source: 'Notícias Brasil',
        sourceUrl: '#',
        publishedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
        category: 'politics',
        tags: ['infraestrutura', 'governo', 'economia'],
        isInternational: false,
        region: region || 'Brasil',
      },
      {
        id: '5',
        title: 'Seleção brasileira vence amistoso internacional',
        description: 'Brasil vence Argentina por 2x1 em jogo emocionante.',
        content:
          'Em partida disputada no Maracanã, a seleção brasileira venceu a Argentina por 2 a 1, com gols no segundo tempo. A vitória aumenta a confiança da equipe para os próximos compromissos.',
        imageUrl: 'https://via.placeholder.com/800x400?text=Futebol',
        source: 'Esporte Total',
        sourceUrl: '#',
        publishedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
        category: 'sports',
        tags: ['futebol', 'seleção', 'esporte'],
        isInternational: false,
        region: region || 'Brasil',
      },
      {
        id: '6',
        title: 'Startup brasileira recebe investimento milionário',
        description:
          'Empresa de tecnologia capta R$ 50 milhões em rodada de investimentos.',
        content:
          'Uma startup brasileira do setor de fintechs anunciou ter recebido R$ 50 milhões em uma rodada de investimentos liderada por fundos internacionais. Os recursos serão usados para expansão.',
        imageUrl: 'https://via.placeholder.com/800x400?text=Startup',
        source: 'TechBrasil',
        sourceUrl: '#',
        publishedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        category: 'technology',
        tags: ['startup', 'tecnologia', 'investimento'],
        isInternational: false,
        region: region || 'Brasil',
      },
    ].slice(0, limit);
  }
}

