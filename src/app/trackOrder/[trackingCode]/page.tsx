// app/track-order/[trackingCode]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  FiSearch, FiCheckCircle, FiTruck, FiPackage, 
  FiClock, FiMapPin, FiAlertCircle, FiArrowRight 
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

const statusStages = [
  { 
    id: 'processing', 
    label: 'Processing', 
    icon: <FiPackage className="w-5 h-5" />, 
    description: 'Your order is being prepared' 
  },
  { 
    id: 'shipped', 
    label: 'Shipped', 
    icon: <FiTruck className="w-5 h-5" />, 
    description: 'Your order has left our facility' 
  },
  { 
    id: 'in_transit', 
    label: 'In Transit', 
    icon: <FiTruck className="w-5 h-5" />, 
    description: 'Your order is on its way' 
  },
  { 
    id: 'out_for_delivery', 
    label: 'Out for Delivery', 
    icon: <FiTruck className="w-5 h-5" />, 
    description: 'Your order will arrive today' 
  },
  { 
    id: 'delivered', 
    label: 'Delivered', 
    icon: <FiCheckCircle className="w-5 h-5" />, 
    description: 'Your order has arrived' 
  },
  { 
    id: 'cancelled', 
    label: 'Cancelled', 
    icon: <FiAlertCircle className="w-5 h-5" />, 
    description: 'Your order was cancelled' 
  }
];

export default function TrackOrderPage() {
  const router = useRouter();
  const params = useParams();
  const [trackingInput, setTrackingInput] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get tracking code from URL
  const trackingCode = Array.isArray(params.trackingCode) 
    ? params.trackingCode[0] 
    : params.trackingCode || '';

  useEffect(() => {
    if (trackingCode) {
      fetchOrder(trackingCode);
      setTrackingInput(trackingCode);
    }
  }, [trackingCode]);

  const fetchOrder = async (code: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://maeva-three.vercel.app/api/orders/track?code=${encodeURIComponent(code)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch order details');
      }

      const { data } = await response.json();
      setOrder(data);
    } catch (err: any) {
      console.error('Tracking error:', err);
      setError(err.message);
      setOrder(null);
      toast.error(err.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingInput.trim()) {
      toast.error('Please enter a tracking code');
      return;
    }
    router.push(`/track-order/${trackingInput.trim()}`);
  };

  const currentStatusIndex = order 
    ? statusStages.findIndex(stage => stage.id === order.deliveryStatus) 
    : -1;

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Enter your tracking code"
              className="pl-10"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Track Order'}
          </Button>
        </div>
      </form>

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <div className="space-y-4">
            {statusStages.map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="mx-auto max-w-md">
            <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Order not found</h3>
            <p className="mt-2 text-gray-500">
              {error === 'Order not found'
                ? `We couldn't find an order with tracking code "${trackingCode}".`
                : 'There was an error fetching your order details.'}
            </p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => router.push('/track-order')}
            >
              Try another code
            </Button>
          </div>
        </div>
      ) : order ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Order summary */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold mb-1">Order #{order.trackingCode}</h2>
              <p className="text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            {order.progress && (
              <div className="w-full sm:w-48">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-medium">{order.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${order.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Status timeline */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 -z-10">
                <div 
                  className="bg-green-500 w-0.5 transition-all duration-500" 
                  style={{ height: `${(currentStatusIndex / (statusStages.length - 1)) * 100}%` }}
                ></div>
              </div>
              
              <div className="space-y-8">
                {statusStages.map((stage, index) => (
                  <div key={stage.id} className="flex items-start gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      index <= currentStatusIndex ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {stage.icon}
                    </div>
                    <div>
                      <h3 className={`font-medium ${
                        index <= currentStatusIndex ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {stage.label}
                      </h3>
                      <p className="text-sm text-gray-500">{stage.description}</p>
                      {index === currentStatusIndex && order.statusUpdatedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          Updated: {new Date(order.statusUpdatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shipping carrier info */}
          {order.shipping.trackingNumber && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FiTruck className="text-blue-600" />
                Shipping Carrier Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm"><span className="font-medium">Carrier:</span> {order.shipping.carrier || 'Standard Shipping'}</p>
                  <p className="text-sm"><span className="font-medium">Tracking #:</span> {order.shipping.trackingNumber}</p>
                </div>
                {order.shipping.trackingUrl && (
                  <div className="flex items-center">
                    <a 
                      href={order.shipping.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Track on carrier website <FiArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FiMapPin className="text-gray-600" />
                Shipping Information
              </h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {order.customer.name}</p>
                <p><span className="font-medium">Address:</span> {order.customer.address}</p>
                <p><span className="font-medium">Contact:</span> {order.customer.contact}</p>
                {order.customer.email && (
                  <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                )}
                <p className="flex items-center gap-2 mt-3">
                  <FiClock className="text-gray-400" />
                  <span className="font-medium">Estimated Delivery:</span> {order.shipping.estimatedDelivery}
                </p>
              </div>
            </div>

            <div className="border rounded-lg p-6 bg-gray-50">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Order Summary</h3>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.productId} className="flex gap-4 bg-white p-4 rounded-lg shadow-sm">
                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">{item.name}</p>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span className="bg-gray-100 px-2 py-1 rounded-full">
                          {item.quantity} × DZA{item.price.toFixed(2)}
                        </span>
                        {item.size && (
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                            <span 
                              className="inline-block w-4 h-4 rounded-full border border-gray-200"
                              style={{ backgroundColor: item.color }}
                            />
                            Color
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>DZA{order.payment.subtotal.toFixed(2)}</span>
                  </div>
                  {order.payment.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-DZA{order.payment.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>DZA{order.payment.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-gray-200 text-gray-900">
                    <span>Total:</span>
                    <span>DZA{order.payment.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="mx-auto max-w-md">
            <FiSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Track your order</h3>
            <p className="mt-2 text-gray-500">
              Enter your tracking code above to see the current status of your order.
            </p>
          </div>
        </div>
      )}

      <div>
      <Link href="/"
         className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-100">
         Retour
      </Link>
      </div>
    </main>
  );
}