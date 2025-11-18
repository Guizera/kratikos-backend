import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { Poll } from '../polls/entities/poll.entity';
import { NewsArticle } from '../news/entities/news-article.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Poll)
    private pollRepository: Repository<Poll>,
    @InjectRepository(NewsArticle)
    private newsRepository: Repository<NewsArticle>,
  ) {}

  /**
   * Buscar usuários por nome ou email
   */
  async searchUsers(query: string, limit: number = 20) {
    const users = await this.userRepository.find({
      where: [
        { name: ILike(`%${query}%`) },
        { email: ILike(`%${query}%`) },
      ],
      take: limit,
      order: { name: 'ASC' },
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
    }));
  }

  /**
   * Buscar posts por título ou conteúdo
   */
  async searchPosts(query: string, limit: number = 20) {
    const posts = await this.postRepository.find({
      where: [
        { title: ILike(`%${query}%`) },
        { content: ILike(`%${query}%`) },
      ],
      relations: ['author'],
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.name,
            photoUrl: post.author.photoUrl,
          }
        : null,
      imageUrl: post.imageUrl,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      viewsCount: post.viewsCount,
      createdAt: post.createdAt,
    }));
  }

  /**
   * Buscar enquetes por título ou conteúdo
   */
  async searchPolls(query: string, limit: number = 20) {
    const polls = await this.pollRepository.find({
      where: [
        { question: ILike(`%${query}%`) },
        { description: ILike(`%${query}%`) },
      ],
      relations: ['post', 'post.author', 'options'],
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return polls.map(poll => {
      // Calcular total de votos somando os votos de todas as opções
      const votesCount = poll.options?.reduce((sum, option) => sum + (option.votesCount || 0), 0) || 0;

      return {
        id: poll.id,
        question: poll.question,
        description: poll.description,
        author: poll.post?.author
          ? {
              id: poll.post.author.id,
              name: poll.post.author.name,
              photoUrl: poll.post.author.photoUrl,
            }
          : null,
        votesCount,
        endsAt: poll.endDate,
        status: poll.status,
        createdAt: poll.createdAt,
      };
    });
  }

  /**
   * Buscar em tudo (usuários, posts, enquetes e notícias)
   */
  async searchAll(query: string, limit: number = 10) {
    const [users, posts, polls, news] = await Promise.all([
      this.searchUsers(query, limit),
      this.searchPosts(query, limit),
      this.searchPolls(query, limit),
      this.searchNews(query, limit),
    ]);

    return {
      users,
      posts,
      polls,
      news,
      total: users.length + posts.length + polls.length + news.length,
    };
  }

  /**
   * Buscar usuários sugeridos (mais populares/ativos)
   */
  async getSuggestedUsers(limit: number = 10) {
    const users = await this.userRepository.find({
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      photoUrl: user.photoUrl,
      createdAt: user.createdAt,
    }));
  }

  /**
   * Buscar trending posts (mais curtidos/comentados)
   */
  async getTrendingPosts(limit: number = 10) {
    const posts = await this.postRepository.find({
      relations: ['author'],
      take: limit,
      order: {
        likesCount: 'DESC',
        commentsCount: 'DESC',
      },
    });

    return posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      author: post.author
        ? {
            id: post.author.id,
            name: post.author.name,
            photoUrl: post.author.photoUrl,
          }
        : null,
      imageUrl: post.imageUrl,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      viewsCount: post.viewsCount,
      createdAt: post.createdAt,
    }));
  }

  /**
   * Buscar notícias por título ou descrição
   */
  async searchNews(query: string, limit: number = 20) {
    const news = await this.newsRepository.find({
      where: [
        { title: ILike(`%${query}%`), isActive: true },
        { description: ILike(`%${query}%`), isActive: true },
      ],
      take: limit,
      order: { publishedAt: 'DESC' },
    });

    return news.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      imageUrl: article.imageUrl,
      source: article.sourceName,
      sourceUrl: article.sourceUrl,
      author: article.author,
      category: article.category,
      tags: article.tags,
      scope: article.scope,
      publishedAt: article.publishedAt,
      likesCount: article.likesCount,
      sharesCount: article.sharesCount,
      viewsCount: article.viewsCount,
    }));
  }
}

