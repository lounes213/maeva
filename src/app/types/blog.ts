import { ReactNode } from "react";

export interface IBlogPost {
  [x: string]: ReactNode;
  _id: string;
  title: string;
  content: string;
  slug: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}
