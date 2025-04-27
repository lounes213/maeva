export interface IBlogPost {
  _id: string;
  title: string;
  content: string;
  slug: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}
