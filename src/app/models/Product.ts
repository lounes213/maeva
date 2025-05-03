import mongoose, { Schema, model, models } from 'mongoose';

interface IProduct {
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
  promoPrice?: number;
  reviews?: string;
  rating?: number;
  reviewCount?: number;
  deliveryDate?: Date | string;
  deliveryAddress?: string;
  deliveryStatus?: string;
  imageUrls?: string[];
  images?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du produit est requis'],
      trim: true,
      maxlength: [100, 'Le nom du produit ne peut pas dépasser 100 caractères'],
    },
    reference: {
      type: String,
      required: [true, 'La référence du produit est requise'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'La description du produit est requise'],
    },
    price: {
      type: Number,
      required: [true, 'Le prix du produit est requis'],
      min: [0, 'Le prix ne peut pas être négatif'],
    },
    stock: {
      type: Number,
      required: [true, 'Le stock du produit est requis'],
      min: [0, 'Le stock ne peut pas être négatif'],
    },
    category: {
      type: String,
      required: [true, 'La catégorie est requise'],
      trim: true,
    },
    tissu: {
      type: String,
      trim: true,
    },
    couleurs: {
      type: [String],
      default: [],
    },
    taille: {
      type: [String],
      default: [],
    },
    sold: {
      type: Number,
      default: 0,
    },
    promotion: {
      type: Boolean,
      default: false,
    },
    promoPrice: {
      type: Number,
    },
    reviews: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryDate: {
      type: Date,
    },
    deliveryAddress: {
      type: String,
    },
    deliveryStatus: {
      type: String,
      enum: ['en attente', 'expédié', 'livré', 'annulé', 'retourné', ''],
      default: '',
    },
    imageUrls: [{
      type: String,
    }],
    images: [{
      type: String,
    }],
  },
  {
    timestamps: true,
  }
);

export const Product = models.Product || model<IProduct>('Product', productSchema);