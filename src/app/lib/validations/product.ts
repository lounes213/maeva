import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Le nom du produit est requis').max(100),
  reference: z.string().min(1, 'La référence du produit est requise'),
  description: z.string().min(1, 'La description du produit est requise'),
  category: z.string().min(1, 'La catégorie du produit est requise'),
  price: z.number().min(0, 'Le prix doit être positif'),
  stock: z.number().min(0, 'Le stock doit être positif'),
  promoPrice: z.number().optional(),
  tissu: z.string().optional(),
  colors: z.array(z.string()).optional(),
  taille: z.array(z.string()).optional(),
  promotion: z.boolean().optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0),
    unit: z.string()
  }).optional(),
  materials: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  availabilityDate: z.string().optional(),
  manufacturer: z.string().optional(),
  sku: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  weight: z.number().min(0).optional(),
  minOrderQuantity: z.number().min(1).optional()
}); 