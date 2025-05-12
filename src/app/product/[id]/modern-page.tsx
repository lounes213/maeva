'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Heart, ShoppingCart, Truck, Clock, Check, ChevronDown, Star, Share2, 
  ArrowLeft, Plus, Minus, Info, ShieldCheck, RefreshCw, ChevronRight
} from 'lucide-react';
import { useCart } from '@/app/context/cartContext';
import Header from '@/app/components/header';
import Footer from '@/app/components/footer';
import { ModernButton } from '@/components/ui/modern-button';
import { ProductCard } from '@/components/ui/product-card';
import toast from 'react-hot-toast';
import ReviewModal from '@/app/components/ReviewModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handleReviewSubmitted = () => {
    // Rafraîchir les données du produit après l'ajout d'un avis
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?id=${id}`);
        const data = await res.json();
        setProduct(data.data);
      } catch (error) {
        console.error('Erreur lors du rafraîchissement des données:', error);
      }
    };
    fetchProduct();
  };

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products?id=${id}`);
        const data = await res.json();
        setProduct(data.data);
        
        // Fetch related products
        if (data.data?.category) {
          const relatedRes = await fetch(`/api/products?category=${data.data.category}&limit=4&exclude=${id}`);
          const relatedData = await relatedRes.json();
          setRelatedProducts(relatedData.data || []);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Helper function to process color strings from the database
  const processColors = (colors: string[] | undefined) => {
    if (!colors || colors.length === 0) return [];
    
    // Process each color entry which might contain comma-separated values
    const processedColors: string[] = [];
    colors.forEach(colorItem => {
      // Check if the color string contains commas
      if (colorItem.includes(',')) {
        // Split by comma and add each color to the array
        colorItem.split(',').forEach(color => {
          if (color.trim()) processedColors.push(color.trim());
        });
      } else {
        // Add the single color to the array
        processedColors.push(colorItem);
      }
    });
    
    return processedColors;
  };

  // Helper function to process sizes from the database
  const processSizes = (sizes: string[] | undefined) => {
    if (!sizes || sizes.length === 0) return [];
    
    // Process each size entry which might contain comma-separated values
    const processedSizes: string[] = [];
    sizes.forEach(sizeItem => {
      // Check if the size string contains commas
      if (sizeItem.includes(',')) {
        // Split by comma and add each size to the array
        sizeItem.split(',').forEach(size => {
          if (size.trim()) processedSizes.push(size.trim());
        });
      } else {
        // Add the single size to the array
        processedSizes.push(sizeItem);
      }
    });
    
    return processedSizes;
  };

  // Helper function to determine text color based on background
  const getTextColor = (bgColor: string) => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate perceived brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return white for dark backgrounds, black for light backgrounds
    return brightness > 125 ? '#000000' : '#ffffff';
  };

  useEffect(() => {
    if (product) {
      // Set initial selected values when product loads
      const colors = processColors(product.couleurs);
      const sizes = processSizes(product.taille);
      
      if (colors.length > 0) setSelectedColor(colors[0]);
      if (sizes.length > 0) setSelectedSize(sizes[0]);
    }
  }, [product]);

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    
    const { left, top, width, height } = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-4xl mb-4">Produit introuvable</div>
        <ModernButton 
          onClick={() => router.push('/shop')}
          variant="primary"
        >
          Retour aux produits
        </ModernButton>
      </div>
    );
  }

  // Process colors and sizes
  const colors = processColors(product.couleurs);
  const sizes = processSizes(product.taille);
  
  // Calculate discount price if promotion is active
  const originalPrice = product.price;
  const discountPrice = product.promoPrice || (product.promotion ? product.price * 0.8 : null);
  const discountPercentage = discountPrice ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100) : 0;

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedColor && colors.length > 0) {
      toast.error('Veuillez sélectionner une couleur');
      return;
    }
    
    if (!selectedSize && sizes.length > 0) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }
    
    // Get the actual price (considering promotions)
    const actualPrice = discountPrice || originalPrice;
    
    // Create cart item object
    const cartItem = {
      id: product._id,
      name: product.name,
      price: actualPrice,
      image: product.imageUrls[0], // Use first image as thumbnail
      quantity: quantity,
      color: selectedColor,
      size: selectedSize
    };
    
    // Add to cart using the context function
    addToCart(cartItem);
    
    // Show success message
    toast.success('Produit ajouté au panier');
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    if (!selectedColor && colors.length > 0) {
      toast.error('Veuillez sélectionner une couleur');
      return;
    }
    
    if (!selectedSize && sizes.length > 0) {
      toast.error('Veuillez sélectionner une taille');
      return;
    }
    
    // Add to cart first
    handleAddToCart();
    
    // Navigate to checkout
    router.push('/checkout');
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  return (
    <>
      <Header/> 
      
      <main className="pt-32 pb-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <nav className="flex items-center text-sm text-gray-500">
            <button onClick={() => router.push('/')} className="hover:text-amber-600 transition-colors">
              Accueil
            </button>
            <ChevronRight className="w-4 h-4 mx-2" />
            <button onClick={() => router.push('/shop')} className="hover:text-amber-600 transition-colors">
              Boutique
            </button>
            <ChevronRight className="w-4 h-4 mx-2" />
            <button 
              onClick={() => router.push(`/shop/${product.category}`)} 
              className="hover:text-amber-600 transition-colors capitalize"
            >
              {product.category}
            </button>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        {/* Product details */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left column - Images */}
            <div className="space-y-6">
              {/* Main image with zoom effect */}
              <div 
                ref={imageContainerRef}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 cursor-zoom-in"
                onMouseMove={handleImageZoom}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onClick={() => window.open(product.imageUrls[selectedImage], '_blank')}
              >
                <Image
                  src={product.imageUrls[selectedImage]}
                  alt={product.name}
                  fill
                  className={`object-contain transition-transform duration-300 ${isZoomed ? 'scale-125' : 'scale-100'}`}
                  style={isZoomed ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` } : undefined}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                
                {/* Promotion badge */}
                {discountPrice && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                    -{discountPercentage}%
                  </div>
                )}
              </div>
              
              {/* Thumbnail gallery */}
              <div className="grid grid-cols-5 gap-3">
                {product.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative aspect-square rounded-lg overflow-hidden bg-gray-50 hover-scale transition-all duration-300
                      ${selectedImage === i 
                        ? 'ring-2 ring-amber-600 shadow-md' 
                        : 'hover:ring-1 hover:ring-amber-300'}`}
                  >
                    <Image 
                      src={url} 
                      alt={`${product.name} - image ${i+1}`} 
                      fill
                      className="object-cover" 
                      sizes="(max-width: 768px) 20vw, 10vw"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right column - Product info */}
            <div className="flex flex-col">
              {/* Product header */}
              <div className="mb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={18} 
                            className={star <= Math.round(product.rating || 0) 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {product.rating?.toFixed(1) || '0.0'} ({product.reviewCount || 0} avis)
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{product.sold || 0} vendus</span>
                    </div>
                    
                    {/* Reference */}
                    <div className="text-sm text-gray-500 mb-4">
                      Réf: <span className="font-medium">{product.reference || product._id.substring(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={toggleWishlist}
                    className={`p-3 rounded-full ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'} 
                      hover:bg-opacity-80 transition-colors hover-lift`}
                    aria-label={isWishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart className={isWishlisted ? 'fill-red-500' : ''} size={20} />
                  </button>
                </div>
                
                {/* Price */}
                <div className="flex items-end gap-3 mb-6">
                  {discountPrice ? (
                    <>
                      <p className="text-3xl font-bold text-amber-600">{discountPrice.toFixed(2)} DA</p>
                      <p className="text-lg text-gray-500 line-through">{originalPrice.toFixed(2)} DA</p>
                      <p className="text-sm font-medium bg-amber-100 text-amber-800 px-2 py-1 rounded">
                        Économisez {((originalPrice - discountPrice) * quantity).toFixed(2)} DA
                      </p>
                    </>
                  ) : (
                    <p className="text-3xl font-bold text-amber-600">{originalPrice.toFixed(2)} DA</p>
                  )}
                </div>
                
                {/* Stock status */}
                <div className="flex items-center gap-2 mb-6">
                  {product.stock > 0 ? (
                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                      <Check size={16} className="mr-1" />
                      {product.stock > 10 
                        ? 'En stock' 
                        : `Plus que ${product.stock} en stock`}
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                      <Info size={16} className="mr-1" />
                      Rupture de stock
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Truck size={16} className="mr-1" />
                    Livraison sous 48h
                  </div>
                </div>
                
                {/* Short description */}
                <div className="text-gray-600 mb-6">
                  {product.description.length > 200 
                    ? product.description.substring(0, 200) + '...' 
                    : product.description}
                </div>
              </div>
              
              {/* Divider */}
              <div className="w-full h-px bg-gray-200 mb-6"></div>
              
              {/* Product attributes */}
              <div className="space-y-6 mb-8">
                {/* Tissu */}
                {product.tissu && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tissu</h3>
                    <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm">
                      {product.tissu}
                    </div>
                  </div>
                )}
                
                {/* Colors */}
                {colors.length > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Couleur</h3>
                      {selectedColor && (
                        <span className="text-sm text-gray-500 capitalize">{selectedColor}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color, i) => (
                        <button
                          key={i}
                          onClick={() => handleColorSelect(color)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                            ${selectedColor === color 
                              ? 'ring-2 ring-offset-2 ring-amber-600 scale-110' 
                              : 'hover:scale-105'}`}
                          style={{ backgroundColor: color }}
                          title={color}
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
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-medium text-gray-700">Taille</h3>
                      <button className="text-sm text-amber-600 hover:text-amber-700 hover:underline">
                        Guide des tailles
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size, i) => (
                        <button
                          key={i}
                          onClick={() => handleSizeSelect(size)}
                          className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-300
                            ${selectedSize === size 
                              ? 'border-amber-600 bg-amber-50 text-amber-700 shadow-sm' 
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
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Quantité</h3>
                  <div className="flex items-center">
                    <div className="flex items-center border border-gray-300 rounded-l-md overflow-hidden">
                      <button 
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className={`p-3 ${quantity <= 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        aria-label="Diminuer la quantité"
                      >
                        <Minus size={16} />
                      </button>
                      <div className="w-12 text-center font-medium">{quantity}</div>
                      <button 
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className={`p-3 ${quantity >= product.stock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'}`}
                        aria-label="Augmenter la quantité"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    
                    <div className="ml-4 text-sm text-gray-500">
                      {product.stock > 0 ? `${product.stock} disponibles` : 'Rupture de stock'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-4 mt-auto">
                <ModernButton
                  variant="outline"
                  size="lg"
                  fullWidth
                  leftIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  Ajouter au panier
                </ModernButton>
                
                <ModernButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                >
                  Acheter maintenant
                </ModernButton>
              </div>
              
              {/* Benefits */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <ShieldCheck className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Garantie qualité</p>
                    <p className="text-xs text-gray-500">Satisfaction garantie</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Truck className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Livraison rapide</p>
                    <p className="text-xs text-gray-500">Sous 48h en Algérie</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <RefreshCw className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Retours faciles</p>
                    <p className="text-xs text-gray-500">14 jours pour changer d'avis</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShoppingCart className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Paiement sécurisé</p>
                    <p className="text-xs text-gray-500">CB ou à la livraison</p>
                  </div>
                </div>
              </div>
              
              {/* Share */}
              <div className="mt-8 flex items-center justify-end gap-2">
                <span className="text-sm text-gray-500">Partager:</span>
                <button 
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: `Découvrez ${product.name} sur MAEVA`,
                        url: window.location.href
                      }).catch((error) => console.error('Error sharing:', error));
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Lien copié dans le presse-papier');
                    }
                  }}
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Tabs section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-200 pb-0 mb-6">
              <TabsTrigger 
                value="description" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-700 rounded-none px-6 py-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="specifications" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-700 rounded-none px-6 py-3"
              >
                Spécifications
              </TabsTrigger>
              <TabsTrigger 
                value="shipping" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-700 rounded-none px-6 py-3"
              >
                Livraison et retours
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-amber-600 data-[state=active]:text-amber-700 rounded-none px-6 py-3"
              >
                Avis ({product.reviewCount || 0})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="animate-fade-in">
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{product.description || 'Aucune description disponible pour ce produit.'}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="animate-fade-in">
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Caractéristiques</h3>
                    <dl className="space-y-3">
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Référence</dt>
                        <dd className="text-sm text-gray-900 col-span-2">{product.reference || product._id.substring(0, 8).toUpperCase()}</dd>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                        <dd className="text-sm text-gray-900 col-span-2 capitalize">{product.category}</dd>
                      </div>
                      {product.tissu && (
                        <div className="grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500">Tissu</dt>
                          <dd className="text-sm text-gray-900 col-span-2">{product.tissu}</dd>
                        </div>
                      )}
                      {colors.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500">Couleurs</dt>
                          <dd className="text-sm text-gray-900 col-span-2">
                            <div className="flex flex-wrap gap-1">
                              {colors.map((color, i) => (
                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                  {color}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                      {sizes.length > 0 && (
                        <div className="grid grid-cols-3 gap-4">
                          <dt className="text-sm font-medium text-gray-500">Tailles</dt>
                          <dd className="text-sm text-gray-900 col-span-2">
                            <div className="flex flex-wrap gap-1">
                              {sizes.map((size, i) => (
                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {size}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Entretien</h3>
                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex items-start">
                        <Check size={16} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Lavage à la main recommandé</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Ne pas utiliser d'eau de javel</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Repasser à basse température</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Séchage à plat</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={16} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Nettoyage à sec possible</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shipping" className="animate-fade-in">
              <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de livraison</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <Truck className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Livraison standard</p>
                          <p className="text-sm text-gray-600">2-4 jours ouvrables</p>
                          <p className="text-sm text-gray-600">Gratuite à partir de 5000 DA d'achat</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Clock className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Livraison express</p>
                          <p className="text-sm text-gray-600">24h (supplément de 1000 DA)</p>
                          <p className="text-sm text-gray-600">Disponible uniquement dans certaines wilayas</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Politique de retour</h3>
                    <ul className="space-y-4">
                      <li className="flex items-start">
                        <RefreshCw className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Retours acceptés</p>
                          <p className="text-sm text-gray-600">Dans les 14 jours suivant la réception</p>
                          <p className="text-sm text-gray-600">Les articles doivent être dans leur état d'origine, non portés et avec toutes les étiquettes</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <Info className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">Frais de retour</p>
                          <p className="text-sm text-gray-600">Les frais de retour sont à la charge du client, sauf en cas d'article défectueux</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="animate-fade-in">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Avis clients</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Voir ce que nos clients pensent de ce produit
                    </p>
                  </div>
                  <ModernButton
                    onClick={() => setIsReviewModalOpen(true)}
                    variant="primary"
                  >
                    Donner mon avis
                  </ModernButton>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Rating summary */}
                  <div className="lg:col-span-4">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="text-center mb-6">
                        <div className="text-5xl font-bold text-gray-900 mb-2">
                          {product.rating ? product.rating.toFixed(1) : '0.0'}
                        </div>
                        <div className="flex justify-center mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(product.rating || 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">
                          Basé sur {product.reviewCount || 0} avis
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
                              <div className="w-12 text-sm text-gray-600">{rating} étoiles</div>
                              <div className="flex-1 mx-2">
                                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                  <div
                                    className="h-2 rounded-full bg-yellow-400 transition-all duration-1000"
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
                      {product.reviews && JSON.parse(product.reviews).length > 0 ? (
                        JSON.parse(product.reviews).map((review: any, index: number) => (
                          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                            <div className="flex items-center mb-4">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-amber-600">
                                    {review.userName?.charAt(0) || 'A'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{review.userName || 'Anonyme'}</p>
                                <div className="flex items-center mt-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? 'text-yellow-400 fill-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-2 text-xs text-gray-500">
                                    {new Date(review.date).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-4">{review.comment}</p>
                            {review.images?.length > 0 && (
                              <div className="grid grid-cols-4 gap-2">
                                {review.images.map((image: string, i: number) => (
                                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                                    <Image
                                      src={image}
                                      alt={`Review image ${i + 1}`}
                                      fill
                                      className="object-cover hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <p className="text-gray-500 mb-4">Aucun avis pour le moment</p>
                          <ModernButton
                            onClick={() => setIsReviewModalOpen(true)}
                            variant="outline"
                            size="sm"
                          >
                            Soyez le premier à donner votre avis
                          </ModernButton>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
        
        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Produits similaires</h2>
              <Link href={`/shop/${product.category}`} className="text-amber-600 hover:text-amber-700 flex items-center">
                Voir plus
                <ChevronRight className="ml-1 w-5 h-5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((product, index) => (
                <div key={product._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <ProductCard product={product} variant="default" />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      
      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        productId={product?._id || ''}
        onSuccess={handleReviewSubmitted}
      />
      
      <Footer />
    </>
  );
}