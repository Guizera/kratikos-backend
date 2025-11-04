export class NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  source: string;
  sourceUrl: string;
  publishedAt: Date;
  category: string;
  tags: string[];
  isInternational: boolean;
  region?: string;
}

