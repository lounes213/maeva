'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '../../components/header';
import Footer from '../../components/footer';
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { ModernButton } from '@/components/ui/modern-button';
import Link from 'next/link';

export default function TrackOrderByCodePage() {
  const params = useParams();
  const router = useRouter();
  const orderCode = params.code as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState<null | {
    status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'not-found';
    orderNumber: string;
    date: string;
    items: number;
    trackingNumber?: string;
    estimatedDelivery?: string;
    shippingAddress?: string;
    statusHistory?: {
      status: string;
      date: string;
      location?: string;
    }[];
  }>(null);

  useEffect(() => {
    if (!orderCode) {
      router.push('/track-order');
      return;
    }

    const fetchOrderData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/orders/track?code=${orderCode}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          const orderData = result.data;
          
          // Format date
          const createdDate = new Date(orderData.createdAt);
          const formattedDate = createdDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          });
          
          // Map API data to our component state format
          let mappedStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'not-found';
          
          // Map the delivery status from the API to our component's status format
          switch (orderData.deliveryStatus) {
            case 'processing':
              mappedStatus = 'processing';
              break;
            case 'shipped':
            case 'in_transit':
            case 'out_for_delivery':
              mappedStatus = 'shipped';
              break;
            case 'delivered':
              mappedStatus = 'delivered';
              break;
            case 'cancelled':
            case 'returned':
              mappedStatus = 'cancelled';
              break;
            default:
              mappedStatus = 'processing';
          }
          
          // Format tracking history
          const formattedHistory = orderData.trackingHistory.map((event: any) => {
            const eventDate = new Date(event.date);
            const formattedEventDate = eventDate.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            
            // Map status to French
            let statusText;
            switch (event.status) {
              case 'processing':
                statusText = 'En cours de traitement';
                break;
              case 'shipped':
                statusText = 'Expédiée';
                break;
              case 'in_transit':
                statusText = 'En transit';
                break;
              case 'out_for_delivery':
                statusText = 'En cours de livraison';
                break;
              case 'delivered':
                statusText = 'Livrée';
                break;
              case 'cancelled':
                statusText = 'Annulée';
                break;
              case 'returned':
                statusText = 'Retournée';
                break;
              default:
                statusText = event.status;
            }
            
            return {
              status: statusText,
              date: formattedEventDate,
              location: event.location
            };
          });
          
          setOrderStatus({
            status: mappedStatus,
            orderNumber: orderData.trackingCode,
            date: formattedDate,
            items: orderData.items.length,
            trackingNumber: orderData.shipping?.trackingNumber,
            estimatedDelivery: orderData.shipping?.estimatedDelivery,
            shippingAddress: orderData.customer?.address,
            statusHistory: formattedHistory.reverse() // Most recent first
          });
        } else {
          setOrderStatus({
            status: 'not-found',
            orderNumber: orderCode,
            date: '',
            items: 0
          });
        }
      } catch (error) {
        console.error('Error fetching order data:', error);
        setOrderStatus({
          status: 'not-found',
          orderNumber: orderCode,
          date: '',
          items: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderCode, router]);

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="w-12 h-12 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-12 h-12 text-amber-500" />;
      case 'delivered':
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-12 h-12 text-red-500" />;
      default:
        return <Package className="w-12 h-12 text-gray-500" />;
    }
  };

  const renderStatusText = (status: string) => {
    switch (status) {
      case 'processing':
        return 'En cours de traitement';
      case 'shipped':
        return 'Expédiée';
      case 'delivered':
        return 'Livrée';
      case 'cancelled':
        return 'Annulée';
      case 'not-found':
        return 'Commande introuvable';
      default:
        return 'Statut inconnu';
    }
  };

  const renderStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-amber-100 text-amber-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center font-serif">Suivi de Commande</h1>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Commande #{orderCode}</h2>
              <Link href="/track-order" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                Suivre une autre commande
              </Link>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            ) : orderStatus ? (
              orderStatus.status === 'not-found' ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Commande introuvable</h2>
                  <p className="text-gray-600 mb-6">
                    Nous n'avons pas pu trouver de commande correspondant à ce numéro. Veuillez vérifier le numéro de commande saisi.
                  </p>
                  <Link href="/track-order">
                    <ModernButton variant="primary">
                      Réessayer avec un autre numéro
                    </ModernButton>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                    <div className="flex-shrink-0">
                      {renderStatusIcon(orderStatus.status)}
                    </div>
                    <div className="flex-grow text-center md:text-left">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${renderStatusColor(orderStatus.status)} mb-2`}>
                        {renderStatusText(orderStatus.status)}
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                        Commande #{orderStatus.orderNumber}
                      </h2>
                      <p className="text-gray-600">
                        Passée le {orderStatus.date} • {orderStatus.items} article{orderStatus.items > 1 ? 's' : ''}
                      </p>
                      
                      {orderStatus.trackingNumber && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">Numéro de suivi:</p>
                          <p className="text-lg font-medium text-gray-900">{orderStatus.trackingNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {orderStatus.estimatedDelivery && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Livraison estimée</h3>
                        <p className="text-gray-600">{orderStatus.estimatedDelivery}</p>
                      </div>
                    )}
                    
                    {orderStatus.shippingAddress && (
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Adresse de livraison</h3>
                        <p className="text-gray-600">{orderStatus.shippingAddress}</p>
                      </div>
                    )}
                  </div>
                  
                  {orderStatus.statusHistory && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Historique de la commande</h3>
                      <div className="relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                        <ul className="space-y-6">
                          {orderStatus.statusHistory.map((event, index) => (
                            <li key={index} className="relative pl-10">
                              <div className="absolute left-0 top-1 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center border-4 border-white">
                                <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{event.status}</p>
                                <p className="text-sm text-gray-500">{event.date}</p>
                                {event.location && (
                                  <p className="text-sm text-gray-500">{event.location}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Erreur</h2>
                <p className="text-gray-600 mb-6">
                  Une erreur s'est produite lors de la recherche de votre commande. Veuillez réessayer.
                </p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-4">
                Besoin d'aide avec votre commande ?
              </p>
              <Link href="/contact">
                <ModernButton variant="primary">
                  Contacter le service client
                </ModernButton>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}