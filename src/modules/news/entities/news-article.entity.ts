export enum NewsScope {
  INTERNACIONAL = 'internacional',
  NACIONAL = 'nacional',
  REGIONAL = 'regional',
}

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
  scope: NewsScope;
  locationLat?: number;
  locationLng?: number;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
}

