'use client';

// Configuration pour éviter le prérendu statique
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/cartContext';
import Header from '../components/header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  days: string;
}

const shippingOptions: ShippingOption[] = [
  { id: 'standard', name: 'Livraison standard', price: 500, days: '3-5 jours ouvrables' },
  { id: 'express', name: 'Livraison express', price: 1000, days: '1-2 jours ouvrables' },
  { id: 'free', name: 'Livraison gratuite', price: 0, days: '5-7 jours ouvrables' },
];

export default function CheckoutPage() {
  const { cartItems, totalItems, totalPrice, clearCart } = useCart();
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(shippingOptions[0]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Add state for customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    city: '',
    postalCode: '',
    contact: '',
    email: '',
    notes: '',
  });
  
  // Add state for form validation
  const [formErrors, setFormErrors] = useState({
    name: '',
    address: '',
    city: '',
    contact: '',
    email: '',
  });

  // Redirect to cart if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router]);

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
  
  // Validate form
  const validateForm = () => {
    const errors = {
      name: '',
      address: '',
      city: '',
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
    
    if (!customerInfo.city.trim()) {
      errors.city = 'La ville est requise';
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
        productId: item._id,
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
      <div>
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold mb-8 text-center">Votre panier est vide</h1>
          <div className="text-center">
            <Button asChild>
              <Link href="/shop">Découvrir nos produits</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
          Finaliser votre commande
        </h1>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <form onSubmit={handleCheckout}>
                <h2 className="text-lg font-bold text-gray-800 mb-6">Informations de livraison</h2>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleCustomerInfoChange}
                      className={formErrors.name ? 'border-red-500' : ''}
                      placeholder="Entrez votre nom complet"
                    />
                    {formErrors.name && <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleCustomerInfoChange}
                      className={formErrors.email ? 'border-red-500' : ''}
                      placeholder="Entrez votre email"
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      id="contact"
                      name="contact"
                      value={customerInfo.contact}
                      onChange={handleCustomerInfoChange}
                      className={formErrors.contact ? 'border-red-500' : ''}
                      placeholder="Entrez votre numéro de téléphone"
                    />
                    {formErrors.contact && <p className="mt-1 text-sm text-red-500">{formErrors.contact}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Adresse <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="address"
                      name="address"
                      value={customerInfo.address}
                      onChange={handleCustomerInfoChange}
                      className={formErrors.address ? 'border-red-500' : ''}
                      placeholder="Entrez votre adresse complète"
                      rows={3}
                    />
                    {formErrors.address && <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ville <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        id="city"
                        name="city"
                        value={customerInfo.city}
                        onChange={handleCustomerInfoChange}
                        className={formErrors.city ? 'border-red-500' : ''}
                        placeholder="Entrez votre ville"
                      />
                      {formErrors.city && <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Code postal
                      </label>
                      <Input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={customerInfo.postalCode}
                        onChange={handleCustomerInfoChange}
                        placeholder="Entrez votre code postal (optionnel)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optionnel)
                    </label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={customerInfo.notes}
                      onChange={handleCustomerInfoChange}
                      placeholder="Instructions spéciales pour la livraison"
                      rows={3}
                    />
                  </div>
                </div>
                
                <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4">Options de livraison</h2>
                
                <RadioGroup 
                  value={selectedShipping.id} 
                  onValueChange={(value) => {
                    const option = shippingOptions.find(opt => opt.id === value);
                    if (option) setSelectedShipping(option);
                  }}
                  className="space-y-3"
                >
                  {shippingOptions.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-gray-50">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <div>
                            <span className="font-medium">{option.name}</span>
                            <p className="text-sm text-gray-500">{option.days}</p>
                          </div>
                          <span className="font-medium">
                            {option.price === 0 ? 'Gratuit' : `DA${option.price.toFixed(2)}`}
                          </span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <div className="mt-8">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
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
                  </Button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Récapitulatif</h2>
              
              <div className="max-h-60 overflow-y-auto mb-4">
                {cartItems.map((item) => (
                  <div key={`${item._id}-${item.color}-${item.size}`} className="flex py-3 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                      {item.imageUrl && (
                        <Image 
                          src={item.imageUrl} 
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</h3>
                      {(item.color || item.size) && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {item.color && <span>Couleur: {item.color}</span>}
                          {item.color && item.size && <span> | </span>}
                          {item.size && <span>Taille: {item.size}</span>}
                        </div>
                      )}
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">Qté: {item.quantity}</span>
                        <span className="text-sm font-medium">DA{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total ({totalItems} article{totalItems > 1 ? 's' : ''})</span>
                    <span className="font-medium">DA{totalPrice.toFixed(2)}</span>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-2">
                      <Input
                        type="text"
                        placeholder="Code promo"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="text-sm"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="ml-2 whitespace-nowrap"
                      >
                        {isApplyingCoupon ? 'Application...' : 'Appliquer'}
                      </Button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  </div>
                  
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Réduction</span>
                      <span>-DA{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison ({selectedShipping.name})</span>
                    <span className="font-medium">
                      {selectedShipping.price === 0 ? 'Gratuite' : `DA${selectedShipping.price.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>DA{(totalPrice + selectedShipping.price - couponDiscount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-gray-500">
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span>Paiement sécurisé</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                  </svg>
                  <span>Paiement à la livraison</span>
                </div>
                <div className="flex flex-col items-center">
                  <svg className="w-8 h-8 text-amber-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <span>Retours faciles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}