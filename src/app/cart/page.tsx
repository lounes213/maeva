'use client';

import { useCart } from "../context/cartContext";
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function CartPage() {
  const router = useRouter(); // Initialize router
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  // Shipping options
  const shippingOptions = [
    { id: 'free', name: 'Free Shipping', price: 0, days: '5-7 Business Days' },
    { id: 'standard', name: 'Standard Shipping', price: 5.99, days: '3-5 Business Days' },
    { id: 'express', name: 'Express Shipping', price: 12.99, days: '1-2 Business Days' }
  ];
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);

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

  // Calculate final price
  const finalPrice = totalPrice + selectedShipping.price - couponDiscount;

  // Handle quantity change with validation
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= 20) {
      updateQuantity(productId, newQuantity);
    }
  };
  
  // Function to handle checkout
  const handleCheckout = () => {
    router.push('/confirm'); // Navigate to the confirm page
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <svg className="w-24 h-24 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          <h2 className="mt-6 text-2xl font-bold text-gray-800">Your cart is empty</h2>
          <p className="mt-2 text-gray-500">Looks like you haven't added any items to your cart yet.</p>
          <Link href="/shop" className="mt-8 inline-block px-6 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 pb-4 border-b border-gray-200">Shopping Cart</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-8">
          <div className="hidden md:flex justify-between text-sm font-semibold text-gray-500 pb-3 border-b">
            <span className="w-2/5">Product</span>
            <span className="w-1/5 text-center">Price</span>
            <span className="w-1/5 text-center">Quantity</span>
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
                        {item.color && <span>Color: {item.color}</span>}
                        {item.color && item.size && <span> | </span>}
                        {item.size && <span>Size: {item.size}</span>}
                      </div>
                    )}
                    <button 
                      onClick={() => removeFromCart(item._id)}
                      className="text-sm text-red-500 hover:text-red-700 mt-2 inline-flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="md:w-1/5 flex justify-between md:justify-center items-center mt-4 md:mt-0">
                  <span className="md:hidden text-gray-500">Price:</span>
                  <span className="font-medium">${item.price.toFixed(2)}</span>
                </div>

                {/* Quantity */}
                <div className="md:w-1/5 flex justify-between md:justify-center items-center mt-4 md:mt-0">
                  <span className="md:hidden text-gray-500">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-md"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-center w-10 select-none">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-md"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total for this item */}
                <div className="md:w-1/5 flex justify-between md:justify-end items-center mt-4 md:mt-0">
                  <span className="md:hidden text-gray-500">Total:</span>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-8">
            <Link href="/products" className="flex items-center text-blue-600 hover:text-blue-800">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Continue Shopping
            </Link>
            <button 
              onClick={clearCart}
              className="text-red-500 hover:text-red-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
              Clear Cart
            </button>
          </div>
        </div>
        
        {/* Order Summary Section */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-medium">${totalPrice.toFixed(2)}</span>
              </div>
              
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${couponDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {selectedShipping.price === 0 ? 'Free' : `DA${selectedShipping.price.toFixed(2)}`}
                </span>
              </div>
              
              <div className="pt-3 mt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">${finalPrice.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tax calculated at checkout</p>
              </div>
            </div>
            
            {/* Shipping Options */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Shipping Method</h3>
              <div className="space-y-2">
                {shippingOptions.map((option) => (
                  <label key={option.id} className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={selectedShipping.id === option.id}
                      onChange={() => setSelectedShipping(option)}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-800">{option.name}</div>
                      <div className="text-sm text-gray-500">{option.days}</div>
                    </div>
                    <div className="font-medium">
                      {option.price === 0 ? 'Free' : `DA${option.price.toFixed(2)}`}
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Coupon Code */}
            <div className="mt-6">
              <h3 className="font-medium text-gray-800 mb-3">Coupon Code</h3>
              <div className="flex">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={applyCoupon}
                  disabled={isApplyingCoupon || !couponCode}
                  className="bg-gray-800 text-white px-4 py-2 rounded-r-md hover:bg-gray-700 disabled:bg-gray-400"
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-sm text-red-500 mt-2">{couponError}</p>}
              {couponDiscount > 0 && <p className="text-sm text-green-600 mt-2">Coupon applied successfully!</p>}
              <p className="text-xs text-gray-500 mt-2">Try code "SAVE10" for 10% off</p>
            </div>
            
            {/* Checkout Button - Updated to navigate to confirm page */}
            <div className="mt-8">
              <button 
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Commander
              </button>
            </div>
          </div>
          
          {/* Trust badges */}
          <div className="mt-6 flex justify-center space-x-6">
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span className="text-xs text-gray-500 mt-1">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
              <span className="text-xs text-gray-500 mt-1">Multiple Payment Options</span>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <span className="text-xs text-gray-500 mt-1">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}