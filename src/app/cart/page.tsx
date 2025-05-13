'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/cartContext';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
}

export default function CartPage() {
  const { cartItems, totalItems, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>({ 
    id: 'free',
    price: 0, 
    name: 'Free Shipping', 
    days: '5-7 Business Days' 
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 20) {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Veuillez entrer un code promo');
      return;
    }

    setIsApplyingCoupon(true);
    setCouponError('');

    // Simuler la vérification du code promo
    setTimeout(() => {
      if (couponCode.toLowerCase() === 'save10') {
        setCouponDiscount(totalPrice * 0.1);
        toast.success('Code promo appliqué avec succès!');
      } else {
        setCouponError('Code promo invalide ou expiré');
        setCouponDiscount(0);
      }
      setIsApplyingCoupon(false);
    }, 800);
  };

  // Add state for customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    contact: '',
    email: '',
  });
  
  // Add state for checkout step
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Cart, 2: Customer Info
  
  // Add state for form validation
  const [formErrors, setFormErrors] = useState({
    name: '',
    address: '',
    contact: '',
    email: '',
  });
  
  // Handle customer info change
  const handleCustomerInfoChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const errors = {
      name: '',
      address: '',
      contact: '',
      email: '',
    };
    let isValid = true;
    
    if (!customerInfo.name.trim()) {
      errors.name = 'Le nom est requis';
      isValid = false;
    }
    
    if (!customerInfo.address.trim()) {
      errors.address = 'L\'adresse est requise';
      isValid = false;
    }
    
    if (!customerInfo.contact.trim()) {
      errors.contact = 'Le numéro de téléphone est requis';
      isValid = false;
    }
    
    if (!customerInfo.email.trim()) {
      errors.email = 'L\'email est requis';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(customerInfo.email)) {
      errors.email = 'Format d\'email invalide';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  // Handle proceed to checkout
  const handleProceedToCheckout = () => {
    setCheckoutStep(2);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle back to cart
  const handleBackToCart = () => {
    setCheckoutStep(1);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const payment = {
        subtotal: totalPrice,
        discount: couponDiscount,
        shipping: selectedShipping.price,
        total: totalPrice + selectedShipping.price - couponDiscount,
      };

      // Mapper les données de livraison aux champs requis par l'API
      const shipping = {
        method: selectedShipping.name,
        cost: selectedShipping.price,
        estimatedDelivery: selectedShipping.days,
      };

      // Mapper les articles du panier pour inclure productId
      const mappedItems = cartItems.map(item => ({
        productId: item._id, // Utiliser _id comme productId
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        size: item.size,
        color: item.color
      }));

      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: mappedItems,
            customer: customerInfo,
            shipping,
            payment,
          }),
        });
      
        const data = await response.json();
      
        if (!response.ok) {
          throw new Error(data.error || 'Une erreur est survenue lors de la commande.');
        }
      
        // Sauvegarder les détails de la commande dans le localStorage
        localStorage.setItem('lastOrder', JSON.stringify({
          trackingCode: data.trackingCode,
          customer: customerInfo,
          shipping: shipping,
          payment: payment,
          items: mappedItems
        }));
      
        // Vider le panier
        clearCart();
      
        // Rediriger vers la page de confirmation
        router.push('/confirm');
      } catch (error) {
        console.error('Erreur lors de la commande :', error);
        const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la commande :', error);
      toast.error('Erreur lors de la création de la commande');
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold mb-8 text-center">Votre Panier</h1>
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-amber-50 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-semibold mb-4">Votre panier est vide</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Vous n'avez pas encore ajouté d'articles à votre panier. Découvrez notre collection et trouvez des pièces uniques qui vous correspondent.
          </p>
          <button
            onClick={() => router.push('/shop')}
            className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 transition"
          >
            Découvrir nos produits
          </button>
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex flex-col items-center p-4">
              <svg className="w-10 h-10 text-amber-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
              <h3 className="font-medium text-gray-900 mb-2">Artisanat Authentique</h3>
              <p className="text-sm text-gray-600 text-center">Chaque pièce est fabriquée à la main par nos artisans qualifiés.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <svg className="w-10 h-10 text-amber-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <h3 className="font-medium text-gray-900 mb-2">Livraison Sécurisée</h3>
              <p className="text-sm text-gray-600 text-center">Nous livrons dans toute l'Algérie avec un suivi de commande en temps réel.</p>
            </div>
            <div className="flex flex-col items-center p-4">
              <svg className="w-10 h-10 text-amber-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
              </svg>
              <h3 className="font-medium text-gray-900 mb-2">Satisfaction Garantie</h3>
              <p className="text-sm text-gray-600 text-center">Nous nous engageons à vous offrir des produits de qualité et un service impeccable.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        {checkoutStep === 1 ? 'Votre Panier' : 'Finaliser votre commande'}
      </h1>
      
      {checkoutStep === 1 ? (
        // Step 1: Cart Items
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="hidden md:flex justify-between text-sm font-semibold text-gray-500 pb-3 border-b">
                <span className="w-2/5">Produit</span>
                <span className="w-1/5 text-center">Prix</span>
                <span className="w-1/5 text-center">Quantité</span>
                <span className="w-1/5 text-right">Total</span>
              </div>
              
              <div className="space-y-6 mt-4">
                {cartItems.map((item) => (
                  <div key={`${item._id}-${item.color}-${item.size}`} className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-200">
                    {/* Product Image & Info */}
                    <div className="flex md:w-2/5">
                      <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden relative">
                        {item.imageUrl && (
                          <div className="relative w-full h-full">
                            <Image 
                              src={item.imageUrl} 
                              alt={item.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex flex-col justify-center">
                        <h3 className="font-medium text-gray-800">{item.name}</h3>
                        {(item.color || item.size) && (
                          <div className="text-sm text-gray-500 mt-1">
                            {item.color && <span>Couleur: {item.color}</span>}
                            {item.color && item.size && <span> | </span>}
                            {item.size && <span>Taille: {item.size}</span>}
                          </div>
                        )}
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="text-sm text-red-500 hover:text-red-700 mt-2 inline-flex items-center"
                        >
                          <FiTrash2 className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="md:w-1/5 flex justify-between md:justify-center items-center mt-4 md:mt-0">
                      <span className="md:hidden text-gray-500">Prix:</span>
                      <span className="font-medium">DA{item.price.toFixed(2)}</span>
                    </div>

                    {/* Quantity */}
                    <div className="md:w-1/5 flex justify-between md:justify-center items-center mt-4 md:mt-0">
                      <span className="md:hidden text-gray-500">Quantité:</span>
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button 
                          onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                          aria-label="Diminuer la quantité"
                        >
                          <FiMinus className="w-3 h-3" />
                        </button>
                        <span className="px-3 py-1 text-center w-10 select-none">{item.quantity}</span>
                        <button 
                          onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                          aria-label="Augmenter la quantité"
                        >
                          <FiPlus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Total for this item */}
                    <div className="md:w-1/5 flex justify-between md:justify-end items-center mt-4 md:mt-0">
                      <span className="md:hidden text-gray-500">Total:</span>
                      <span className="font-medium">DA{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between mt-8 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push('/shop')}
                  className="flex items-center justify-center text-amber-600 hover:text-amber-800 mb-4 sm:mb-0"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Continuer mes achats
                </button>
                <button 
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 flex items-center justify-center"
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  Vider le panier
                </button>
              </div>
            </div>
          </div>
          
          {/* Order Summary Section */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Récapitulatif</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                  <span className="font-medium">DA{totalPrice.toFixed(2)}</span>
                </div>
                
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Réduction</span>
                    <span>-DA{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Livraison</span>
                  <span className="font-medium">
                    {selectedShipping.price === 0 ? 'Gratuite' : `DA${selectedShipping.price.toFixed(2)}`}
                  </span>
                </div>
                
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">DA{(totalPrice + selectedShipping.price - couponDiscount).toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Taxes incluses</p>
                </div>
              </div>
              
              {/* Shipping Options */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">Mode de livraison</h3>
                <div className="space-y-2">
                  {[
                    { id: 'free', name: 'Livraison standard', price: 0, days: '5-7 jours ouvrables' },
                    { id: 'standard', name: 'Livraison rapide', price: 500, days: '3-5 jours ouvrables' },
                    { id: 'express', name: 'Livraison express', price: 1000, days: '1-2 jours ouvrables' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping.id === option.id}
                        onChange={() => setSelectedShipping(option)}
                        className="text-amber-600 focus:ring-amber-500 h-4 w-4"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-800">{option.name}</div>
                        <div className="text-sm text-gray-500">{option.days}</div>
                      </div>
                      <div className="font-medium">
                        {option.price === 0 ? 'Gratuite' : `DA${option.price.toFixed(2)}`}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Coupon Code */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">Code promo</h3>
                <div className="flex">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Entrez votre code promo"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-amber-500 focus:border-amber-500"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode}
                    className="bg-amber-600 text-white px-4 py-2 rounded-r-md hover:bg-amber-700 disabled:bg-amber-400"
                  >
                    {isApplyingCoupon ? 'Application...' : 'Appliquer'}
                  </button>
                </div>
                {couponError && <p className="text-sm text-red-500 mt-2">{couponError}</p>}
                {couponDiscount > 0 && <p className="text-sm text-green-600 mt-2">Code promo appliqué avec succès !</p>}
                <p className="text-xs text-gray-500 mt-2">Essayez le code "SAVE10" pour 10% de réduction</p>
              </div>
              
              {/* Checkout Button */}
              <div className="mt-8">
                <button 
                  onClick={handleProceedToCheckout}
                  className="w-full bg-amber-600 text-white font-medium py-3 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
                >
                  Passer à la commande
                </button>
              </div>
            </div>
            
            {/* Trust badges */}
            <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-medium text-gray-800 mb-4">Achats sécurisés</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span className="text-xs text-gray-600 text-center">Paiement sécurisé</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <span className="text-xs text-gray-600 text-center">Plusieurs options de paiement</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <span className="text-xs text-gray-600 text-center">Retours faciles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Step 2: Customer Information
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <form onSubmit={handleCheckout}>
              <h2 className="text-lg font-bold text-gray-800 mb-6">Informations de livraison</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={customerInfo.name}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-4 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                    placeholder="Entrez votre nom complet"
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={customerInfo.email}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-4 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                    placeholder="Entrez votre adresse email"
                  />
                  {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    value={customerInfo.contact}
                    onChange={handleCustomerInfoChange}
                    className={`w-full px-4 py-2 border ${formErrors.contact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                    placeholder="Entrez votre numéro de téléphone"
                  />
                  {formErrors.contact && <p className="mt-1 text-sm text-red-500">{formErrors.contact}</p>}
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse de livraison <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={customerInfo.address}
                    onChange={handleCustomerInfoChange}
                    rows={3}
                    className={`w-full px-4 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                    placeholder="Entrez votre adresse complète"
                  />
                  {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
                </div>
              </div>
              
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Récapitulatif de la commande</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                    <span className="font-medium">DA{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-DA{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Livraison ({selectedShipping.name})</span>
                    <span className="font-medium">
                      {selectedShipping.price === 0 ? 'Gratuite' : `DA${selectedShipping.price.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">DA{(totalPrice + selectedShipping.price - couponDiscount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBackToCart}
                  className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Retour au panier
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors disabled:bg-amber-400 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Traitement en cours...
                    </>
                  ) : (
                    'Confirmer la commande'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}