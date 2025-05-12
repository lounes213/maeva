/**
 * Add a product to the wishlist
 * @param productId - The ID of the product to add to the wishlist
 * @returns boolean - Whether the product was added (true) or removed (false)
 */
export const toggleWishlistItem = (productId: string): boolean => {
  // Get current wishlist from localStorage
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  // Check if product is already in wishlist
  const index = wishlist.indexOf(productId);
  
  if (index === -1) {
    // Product not in wishlist, add it
    wishlist.push(productId);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    return true;
  } else {
    // Product already in wishlist, remove it
    wishlist.splice(index, 1);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    return false;
  }
};

/**
 * Check if a product is in the wishlist
 * @param productId - The ID of the product to check
 * @returns boolean - Whether the product is in the wishlist
 */
export const isInWishlist = (productId: string): boolean => {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  return wishlist.includes(productId);
};

/**
 * Get all product IDs in the wishlist
 * @returns string[] - Array of product IDs in the wishlist
 */
export const getWishlist = (): string[] => {
  return JSON.parse(localStorage.getItem('wishlist') || '[]');
};

/**
 * Clear the wishlist
 */
export const clearWishlist = (): void => {
  localStorage.setItem('wishlist', '[]');
};