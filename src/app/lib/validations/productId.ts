import { isValidObjectId } from 'mongoose';

export const validateProductId = (id: string): string | null => {
  if (!id) {
    return 'ID du produit requis';
  }
  if (!isValidObjectId(id)) {
    return 'ID de produit invalide';
  }
  return null;
}; 