export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  reference: string;
  tissu?: string;
  couleurs?: string[];
  taille?: string[];
  sold?: number;
  promotion?: boolean;
  promoPrice?: number;
  reviews?: string;
  rating?: number;
  reviewCount?: number;
  deliveryDate?: string;
  deliveryAddress?: string;
  deliveryStatus?: string;
  imageUrls?: string[];
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormValues {
  name: string;
  reference: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  tissu?: string;
  couleurs?: string[];
  taille?: string[];
  sold?: number;
  promotion?: boolean;
  reviews?: string;
  rating?: number;
  reviewCount?: number;
  deliveryDate?: string;
  deliveryAddress?: string;
  deliveryStatus?: string;
}