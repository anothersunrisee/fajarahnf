
export type CardSize = 'square' | 'portrait' | 'landscape' | 'tall' | 'wide';

export interface ProjectMedia {
  type: 'image' | 'video' | 'gif';
  url: string;
  caption?: string;
}

export interface ProjectStat {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  contentImages?: string[];
  tools?: string[];
  size: CardSize;
  link: string;
  videoUrl?: string;
  fullContent?: string;
  gallery?: ProjectMedia[];
  stats?: ProjectStat[];
}

export type Theme = 'light' | 'dark';
