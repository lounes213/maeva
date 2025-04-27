'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiShoppingCart, FiCheckCircle, FiChevronDown } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '../context/cartContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  stock: number;
  couleurs?: string[];
  taille?: string[];
}

export default function ConfirmPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [shippingMethod, setShippingMethod] = useState('free');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shipping options (same as in your cart page)
  const shippingOptions = [
    { id: 'free', name: 'Free Shipping', price: 0, days: '5-7 Business Days' },
    { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '3-5 Business Days' },
    { id: 'express', name: 'Express Shipping', price: 12.99, days: '1-2 Business Days' }
  ];

  const selectedShipping = shippingOptions.find(option => option.id === shippingMethod) || shippingOptions[0];

  // Handle coupon application
  const applyCoupon = () => {
    setIsApplyingCoupon(true);
    setCouponError('');
    
    // Simulate coupon verification
    setTimeout(() => {
      if (couponCode.toLowerCase() === 'save10') {
        setCouponDiscount(totalPrice * 0.1);
      } else {
        setCouponError('Invalid or expired coupon code');
        setCouponDiscount(0);
      }
      setIsApplyingCoupon(false);
    }, 800);
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      router.push('/cart');
      return;
    }

    // Fetch product details for all items in cart
    const fetchProducts = async () => {
      try {
        const productPromises = cartItems.map(item => 
          fetch(`/api/products?id=${item._id}`).then(res => res.json())
        );
        const productData = await Promise.all(productPromises);
        setProducts(productData.map(p => p.data));
      } catch (error) {
        toast.error('Error loading product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [cartItems, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name) newErrors.name = 'Le nom est requis';
    if (!address) newErrors.address = 'L\'adresse est requise';
    if (!contact) newErrors.contact = 'Un contact est requis';
    if (email && !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Email invalide';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    const orderItems = cartItems.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      imageUrl: item.imageUrl,
      size: item.size,
      color: item.color
    }));

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: orderItems,
        customer: { name, address, contact, email },
        shipping: {
          method: selectedShipping.name,
          cost: selectedShipping.price,
          estimatedDelivery: selectedShipping.days
        },
        couponDiscount
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error creating order');
    }

    clearCart();
    router.push(`/trackOrder?code=${data.data.trackingCode}`);

  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
  }
};


           const handleConfirmOrder = () => {
  router.push('/confirm');
};

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Chargement des produits…
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        Votre panier est vide
      </div>
    );
  }

  const subtotal = totalPrice;
  const shippingCost = selectedShipping.price;
  const total = subtotal + shippingCost - couponDiscount;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8 text-indigo-700">
        Finaliser votre commande
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="border rounded-lg p-6 shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Récapitulatif de la commande</h2>
          
          <div className="space-y-4">
            {cartItems.map((item, index) => {
              const product = products.find(p => p?._id === item._id);
              return (
                <div key={`${item._id}-${index}`} className="flex gap-4 pb-4 border-b last:border-b-0">
                  <div className="w-20 h-20 relative rounded-md overflow-hidden bg-gray-100">
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        priority
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-indigo-600 font-bold">{item.price.toFixed(2)} DZA</p>
                    <div className="text-sm text-gray-500 space-y-1 mt-1">
                      {item.color && <p>Couleur: {item.color}</p>}
                      {item.size && <p>Taille: {item.size}</p>}
                      <p>Quantité: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)} DZA</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipping Options */}
          <div className="mt-6">
            <h3 className="font-medium text-gray-800 mb-3">Méthode de livraison</h3>
            <div className="space-y-2">
              {shippingOptions.map((option) => (
                <label key={option.id} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="shipping"
                    value={option.id}
                    checked={shippingMethod === option.id}
                    onChange={() => setShippingMethod(option.id)}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-medium text-gray-800">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.days}</div>
                  </div>
                  <div className="font-medium">
                    {option.price === 0 ? 'Gratuit' : `${option.price.toFixed(2)} DZA`}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-4 border-t">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Sous-total ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} articles)</span>
                <span>{subtotal.toFixed(2)} DZA</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Réduction</span>
                  <span>-{couponDiscount.toFixed(2)} DZA</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Livraison</span>
                <span>{shippingCost === 0 ? 'Gratuit' : `${shippingCost.toFixed(2)} DZA`}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t">
                <span>Total</span>
                <span>{total.toFixed(2)} DZA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Form */}
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Informations de livraison</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet*</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full border rounded px-4 py-2 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Jean Dupont"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète*</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`w-full border rounded px-4 py-2 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="123 Rue de Paris, 75001 Paris"
                rows={3}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone*</label>
              <input
                type="tel"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className={`w-full border rounded px-4 py-2 ${errors.contact ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="06 12 34 56 78"
              />
              {errors.contact && <p className="mt-1 text-sm text-red-600">{errors.contact}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (facultatif)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full border rounded px-4 py-2 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="votre@email.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Coupon Code */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Code promo</label>
              <div className="flex">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Entrez un code promo"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={isApplyingCoupon || !couponCode}
                  className="bg-gray-800 text-white px-4 py-2 rounded-r-md hover:bg-gray-700 disabled:bg-gray-400"
                >
                  {isApplyingCoupon ? 'Application...' : 'Appliquer'}
                </button>
              </div>
              {couponError && <p className="text-sm text-red-500 mt-2">{couponError}</p>}
              {couponDiscount > 0 && <p className="text-sm text-green-600 mt-2">Code promo appliqué!</p>}
              <p className="text-xs text-gray-500 mt-2">Essayez le code "SAVE10" pour 10% de réduction</p>
            </div>

 

<div className="pt-4">
  <button
    onClick={handleConfirmOrder}
    className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
  >
    <FiCheckCircle size={18} />
    Confirmer la commande
  </button>
</div>

            <div className="text-xs text-gray-500 mt-4">
              <p>En confirmant, vous acceptez nos conditions générales de vente.</p>
              <p>Un code de suivi vous sera fourni pour suivre votre commande.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}