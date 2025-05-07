import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Le nom du produit est requis').max(100),
  reference: z.string().min(1, 'La référence du produit est requise'),
  description: z.string().min(1, 'La description du produit est requise'),
  category: z.string().min(1, 'La catégorie du produit est requise'),
  price: z.number().min(0, 'Le prix doit être positif'),
  stock: z.number().min(0, 'Le stock doit être positif'),
  tissu: z.string().optional(),
  couleurs: z.array(z.string()).optional(),
  taille: z.array(z.string()).optional(),
  sold: z.number().min(0).optional().default(0),
  promotion: z.boolean().optional().default(false),
  promoPrice: z.number().optional(),
  reviews: z.string().optional(),
  rating: z.number().min(0).max(5).optional().default(0),
  reviewCount: z.number().min(0).optional().default(0),
  imageUrls: z.array(z.string()).optional(),
  deliveryDate: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryStatus: z.string().optional()
}); 