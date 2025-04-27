export interface Product {
  _id?: string;
  name: string;
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
  deliveryDate?: string;
  deliveryAddress?: string;
  deliveryStatus?: string;
  imageUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFormValues {
  name: string;
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
  deliveryDate?: string;
  deliveryAddress?: string;
  deliveryStatus?: string;
}