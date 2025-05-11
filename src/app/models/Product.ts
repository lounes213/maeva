import mongoose, { Schema, model, models } from 'mongoose';

// app/types/product.ts
export interface Product {
  _id: string;
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
  deliveryStatus?: 'en attente' | 'expédié' | 'livré' | 'annulé' | 'retourné' | '';
  imageUrls?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<Product>(
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
      min: 0,
    },
    promotion: {
      type: Boolean,
      default: false,
    },
    promoPrice: {
      type: Number,
      min: [0, 'Le prix promotionnel ne peut pas être négatif'],
      validate: {
        validator: function(this: Product, value: number) {
          if (!this.promotion) return true;
          return value >= 0 && value < this.price;
        },
        message: 'Le prix promotionnel doit être inférieur au prix normal'
      }
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
    imageUrls: {
      type: [String],
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

// Add pre-save middleware to handle validation
productSchema.pre('save', function(next) {
  if (this.promotion && (!this.promoPrice || this.promoPrice >= this.price)) {
    next(new Error('Le prix promotionnel est requis et doit être inférieur au prix normal'));
  }
  next();
});

export const Product = models.Product || model<Product>('Product', productSchema);