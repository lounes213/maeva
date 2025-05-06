'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, ShoppingCart, Truck, Clock, Check, ChevronDown, Star, Share2 } from 'lucide-react';
import { useCart } from '@/app/context/cartContext';
import Header from '@/app/components/header';
import toast from 'react-hot-toast';
import ReviewModal from '@/app/components/ReviewModal';

// Define TypeScript interfaces
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  reference: string;
  tissu?: string;
  couleurs?: string[];
  taille?: string[];
  imageUrls: string[];
  deliveryDate?: string;
  deliveryAddress?: string;
  deliveryStatus?: string;
  reviews?: string;
  rating?: number;
  reviewCount?: number;
  sold?: number;
  promotion?: boolean;
  promoPrice?: number;
}

interface Review {
  userName: string;
  rating: number;
  comment: string;
  date: string;
  images?: string[];
  onSuccess: (newReview: Review) => void;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // State management
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'livraison' | 'avis'>('description');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<Record<number, boolean>>({});

  // Function to handle image loading errors
  const handleImageError = (index: number) => {
    setImageLoadError(prev => ({ ...prev, [index]: true }));
  };

  // Production-ready image URL handling
  const getImageUrl = useCallback((url: string | undefined, index: number) => {
    if (imageLoadError[index]) return '/placeholder-product.png';
    if (!url) return '/placeholder-product.png';
    if (url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${url}`;
  }, [imageLoadError]);

  // Fetch product data
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ''}/api/products`;
      const res = await fetch(`${apiUrl}?id=${id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch product (Status: ${res.status})`);
      }
      
      const data = await res.json();
      setProduct(data.data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setError(error.message || 'Failed to load product data');
      toast.error('Failed to load product data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Handle review submission
  const handleReviewSubmitted = (newReview: Review) => {
    if (!product) return;
    
    const currentReviews = product.reviews ? JSON.parse(product.reviews) : [];
    const updatedReviews = [newReview, ...currentReviews];
    const totalRatings = updatedReviews.reduce((sum: number, review: Review) => sum + review.rating, 0);
    const newRating = totalRatings / updatedReviews.length;
    
    setProduct({
      ...product,
      reviews: JSON.stringify(updatedReviews),
      rating: newRating,
      reviewCount: (product.reviewCount || 0) + 1
    });
    
    fetchProduct();
  };

  // Initial data fetch
  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Helper functions
  const processColors = (colors: string[] | undefined) => {
    if (!colors || colors.length === 0) return [];
    return colors.flatMap(colorItem => 
      colorItem.includes(',') 
        ? colorItem.split(',').map(color => color.trim()).filter(Boolean)
        : [colorItem]
    );
  };

  const processSizes = (sizes: string[] | undefined) => {
    if (!sizes || sizes.length === 0) return [];
    return sizes.flatMap(sizeItem =>
      sizeItem.includes(',')
        ? sizeItem.split(',').map(size => size.trim()).filter(Boolean)
        : [sizeItem]
    );
  };

  const getTextColor = (bgColor: string) => {
    try {
      if (!bgColor.startsWith('#')) {
        return ['black', 'navy', 'blue', 'dark', 'purple'].some(
          dark => bgColor.toLowerCase().includes(dark)
        ) ? '#ffffff' : '#000000';
      }
      
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 125 ? '#000000' : '#ffffff';
    } catch {
      return '#000000';
    }
  };

  // Set initial selected values
  useEffect(() => {
    if (product) {
      const colors = processColors(product.couleurs);
      const sizes = processSizes(product.taille);
      if (colors.length > 0 && !selectedColor) setSelectedColor(colors[0]);
      if (sizes.length > 0 && !selectedSize) setSelectedSize(sizes[0]);
    }
  }, [product, selectedColor, selectedSize]);

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 text-xl mb-4">Error:</div>
        <div className="text-gray-700 mb-6">{error}</div>
        <button 
          onClick={() => fetchProduct()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  // Product not found state
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-4xl mb-4">Product Not Found</div>
        <button 
          onClick={() => router.push('/products')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Process product data
  const colors = processColors(product.couleurs);
  const sizes = processSizes(product.taille);
  const originalPrice = product.price;
  const discountPrice = product.promotion ? (product.promoPrice || product.price * 0.8) : null;
  const discountPercentage = product.promotion 
    ? Math.round(((originalPrice - (discountPrice || 0)) / originalPrice) * 100) 
    : 0;

  // Handlers
  const handleColorSelect = (color: string) => setSelectedColor(color);
  const handleSizeSelect = (size: string) => setSelectedSize(size);

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedColor || !selectedSize) {
      toast.error('Please select color and size');
      return;
    }
    
    const actualPrice = discountPrice || originalPrice;
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: actualPrice,
      imageUrl: product.imageUrls[0],
      quantity,
      color: selectedColor,
      size: selectedSize
    };
    
    addToCart(cartItem);
    setAddedToCart(true);
    toast.success('Product added to cart!');
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name}`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };

  return (
    <>
      <Header/> 
     
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        {/* Breadcrumb */}
        <div className="mb-6 text-sm text-gray-500">
          <span onClick={() => router.push('/')} className="hover:text-indigo-600 cursor-pointer">Home</span>
          <span className="mx-2">/</span>
          <span onClick={() => router.push('/products')} className="hover:text-indigo-600 cursor-pointer">Products</span>
          <span className="mx-2">/</span>
          <span className="text-gray-800">{product.name}</span>
        </div>

        {/* Product details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left column - Images */}
          <div>
            <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-4">
              <Image
                src={getImageUrl(product.imageUrls[selectedImage], selectedImage)}
                alt={product.name}
                width={500}
                height={500}
                className="object-contain w-full h-full"
                priority
                onError={() => handleImageError(selectedImage)}
              />
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {product.imageUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden border bg-gray-100
                    ${selectedImage === i ? 'ring-2 ring-indigo-600' : 'hover:ring-1 hover:ring-indigo-300'}`}
                >
                  <Image 
                    src={getImageUrl(url, i)} 
                    alt={`${product.name} - image ${i+1}`} 
                    width={150} 
                    height={150}
                    className="object-cover w-full h-full"
                    onError={() => handleImageError(i)}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right column - Product info */}
          <div className="flex flex-col">
            {/* Product header */}
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={16} 
                          className={`${star <= Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{product.sold || 0} sold</span>
                  </div>
                </div>
                <button 
                  onClick={toggleWishlist}
                  className={`p-2 rounded-full ${isWishlisted ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'} hover:bg-opacity-80 transition-colors`}
                >
                  <Heart className={isWishlisted ? 'fill-red-500' : ''} size={20} />
                </button>
              </div>
              
              <div className="flex items-end gap-3 mb-4">
                {discountPrice ? (
                  <>
                    <p className="text-2xl font-bold text-indigo-600">{discountPrice.toFixed(2)} DA</p>
                    <p className="text-lg text-gray-500 line-through">{originalPrice.toFixed(2)} DA</p>
                    <p className="text-sm font-medium bg-red-100 text-red-600 px-2 py-1 rounded">-{discountPercentage}%</p>
                  </>
                ) : (
                  <p className="text-2xl font-bold text-indigo-600">{originalPrice.toFixed(2)} DA</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 mt-2 text-sm">
                <div className={`px-2 py-1 rounded ${
                  product.stock > 10 ? 'bg-green-100 text-green-700' 
                  : product.stock > 0 ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
                }`}>
                  {product.stock > 10 ? 'In stock' 
                   : product.stock > 0 ? `Only ${product.stock} left` 
                   : 'Out of stock'}
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Truck size={16} className="mr-1" />
                  Delivery: {product.deliveryStatus || 'Standard'}
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="w-full h-px bg-gray-200 my-4"></div>
            
            {/* Product attributes */}
            <div className="space-y-6 mb-8">
              {/* Tissu */}
              {product.tissu && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Fabric</h3>
                  <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm">
                    {product.tissu}
                  </div>
                </div>
              )}
              
              {/* Colors */}
              {colors.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Color</h3>
                    {selectedColor && (
                      <span className="text-sm text-gray-500">Selected: {selectedColor}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => handleColorSelect(color)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-600' : ''}`}
                        style={{ backgroundColor: color }}
                      >
                        {selectedColor === color && (
                          <Check size={16} color={getTextColor(color)} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-700">Size</h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700">Size Guide</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size, i) => (
                      <button
                        key={i}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-4 py-2 rounded-md border text-sm font-medium
                          ${selectedSize === size 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity</h3>
                <div className="flex items-center border border-gray-300 rounded-md w-32">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className={`px-3 py-2 ${quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center">{quantity}</div>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className={`px-3 py-2 ${quantity >= product.stock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            
            {/* Delivery */}
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <Truck size={16} />
                <span className="font-medium">Delivery</span>
              </div>
              <p className="text-sm text-gray-600">
                Address: {product.deliveryAddress || 'To be determined'}
              </p>
              <p className="text-sm text-gray-600">
                <Clock size={14} className="inline mr-1" />
                Estimated delivery: 2-4 business days
              </p>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || !selectedColor || !selectedSize}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-indigo-600 rounded-md text-indigo-600 font-medium hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  handleAddToCart();
                  router.push('/cart');
                }}
                disabled={product.stock <= 0 || !selectedColor || !selectedSize}
                className="flex-1 py-3 bg-indigo-600 rounded-md text-white font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
            
            {/* Share */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <span className="text-sm text-gray-500">Share:</span>
              <button 
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                onClick={handleShare}
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs section */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'description'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Description
              </button>
              
              <button
                onClick={() => setActiveTab('livraison')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'livraison'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Delivery & Returns
              </button>

              <button
                onClick={() => setActiveTab('avis')}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'avis'
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({product.reviewCount || 0})
              </button>
            </div>
          </div>

          <div className="mt-8 pb-16">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-gray-700">{product.description || 'No description available for this product.'}</p>
              </div>
            )}

            {activeTab === 'avis' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      See what our customers say about this product
                    </p>
                  </div>
                  <button
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                  >
                    Write a Review
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Rating summary */}
                  <div className="lg:col-span-4">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="text-center mb-4">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {product.rating ? product.rating.toFixed(1) : '0.0'}
                        </div>
                        <div className="flex justify-center mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(product.rating || 0)
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">
                          Based on {product.reviewCount || 0} reviews
                        </p>
                      </div>

                      {/* Rating bars */}
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const reviews = product.reviews ? JSON.parse(product.reviews) : [];
                          const count = reviews.filter((r: any) => r.rating === rating).length;
                          const percentage = product.reviewCount ? (count / product.reviewCount) * 100 : 0;
                          
                          return (
                            <div key={rating} className="flex items-center">
                              <div className="w-12 text-sm text-gray-600">{rating} stars</div>
                              <div className="flex-1 mx-2">
                                <div className="h-2 rounded-full bg-gray-200">
                                  <div
                                    className="h-2 rounded-full bg-yellow-400"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div className="w-12 text-sm text-gray-600 text-right">{count}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reviews list */}
                  <div className="lg:col-span-8">
                    <div className="space-y-6">
                      {product.reviews ? (
                        JSON.parse(product.reviews).map((review: any, index: number) => (
                          <div key={index} className="border-b border-gray-200 pb-6">
                            <div className="flex items-center mb-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-indigo-600">
                                    {review.userName?.charAt(0) || 'A'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{review.userName || 'Anonymous'}</p>
                                <div className="flex items-center mt-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="ml-auto text-sm text-gray-500">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            {review.images?.length > 0 && (
                              <div className="mt-4 grid grid-cols-4 gap-2">
                                {review.images.map((image: string, i: number) => (
                                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                                    <Image
                                      src={image}
                                      alt={`Review image ${i + 1}`}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No reviews yet</p>
                          <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="mt-4 text-indigo-600 hover:text-indigo-700"
                          >
                            Be the first to review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'livraison' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Information</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Standard delivery: 2-4 business days</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Express delivery: 24h (+9.99DA)</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Free delivery for orders over 50DA</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Return Policy</h3>
                  <ul className="text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Returns accepted within 14 days of receipt</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Items must be in original condition with tags</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-green-500 mr-2 mt-1 flex-shrink-0" />
                      <span>Return shipping costs are customer's responsibility</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={product._id}
        onSuccess={handleReviewSubmitted}
      />
    </>
  );
}