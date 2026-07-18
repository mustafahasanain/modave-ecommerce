export interface BlogPost {
  id: number;
  title: string;
  titleAr: string;
  excerpt: string;
  excerptAr: string;
  content?: string;
  contentAr?: string;
  category: string;
  categoryAr: string;
  author: string;
  authorAr: string;
  date: string;
  readTime: number;
  image: string;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
];

export function getBlogPost(id: number) {
  return blogPosts.find((p) => p.id === id);
}
