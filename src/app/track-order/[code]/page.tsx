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

    // Simulate API call with timeout
    const timer = setTimeout(() => {
      // This is a mock response - in a real app, you would fetch this from your API
      if (orderCode.trim()) {
        // For demo purposes, we'll return a mock order based on the first character of the order ID
        const firstChar = orderCode.charAt(0).toLowerCase();
        
        if (firstChar === 'p') {
          setOrderStatus({
            status: 'processing',
            orderNumber: orderCode,
            date: '15 Mai 2023',
            items: 2,
            estimatedDelivery: '20 Mai 2023',
            shippingAddress: 'Rue Ahmed Ben Bella, Alger, Algérie',
            statusHistory: [
              { status: 'Commande reçue', date: '15 Mai 2023, 14:30' },
              { status: 'Paiement confirmé', date: '15 Mai 2023, 14:35' },
              { status: 'En cours de préparation', date: '15 Mai 2023, 16:20' }
            ]
          });
        } else if (firstChar === 's') {
          setOrderStatus({
            status: 'shipped',
            orderNumber: orderCode,
            date: '12 Mai 2023',
            items: 3,
            trackingNumber: 'YT123456789DZ',
            estimatedDelivery: '18 Mai 2023',
            shippingAddress: 'Rue des Frères Bouadou, Tizi Ouzou, Algérie',
            statusHistory: [
              { status: 'Commande reçue', date: '12 Mai 2023, 10:15' },
              { status: 'Paiement confirmé', date: '12 Mai 2023, 10:20' },
              { status: 'En cours de préparation', date: '12 Mai 2023, 14:30' },
              { status: 'Expédiée', date: '14 Mai 2023, 09:45', location: 'Centre de distribution Alger' },
              { status: 'En transit', date: '15 Mai 2023, 11:20', location: 'En route vers Tizi Ouzou' }
            ]
          });
        } else if (firstChar === 'd') {
          setOrderStatus({
            status: 'delivered',
            orderNumber: orderCode,
            date: '5 Mai 2023',
            items: 1,
            trackingNumber: 'YT987654321DZ',
            shippingAddress: 'Boulevard Krim Belkacem, Oran, Algérie',
            statusHistory: [
              { status: 'Commande reçue', date: '5 Mai 2023, 09:30' },
              { status: 'Paiement confirmé', date: '5 Mai 2023, 09:35' },
              { status: 'En cours de préparation', date: '5 Mai 2023, 11:20' },
              { status: 'Expédiée', date: '6 Mai 2023, 10:15', location: 'Centre de distribution Alger' },
              { status: 'En transit', date: '7 Mai 2023, 08:45', location: 'En route vers Oran' },
              { status: 'En cours de livraison', date: '8 Mai 2023, 09:30', location: 'Oran' },
              { status: 'Livrée', date: '8 Mai 2023, 14:20', location: 'Oran' }
            ]
          });
        } else if (firstChar === 'c') {
          setOrderStatus({
            status: 'cancelled',
            orderNumber: orderCode,
            date: '2 Mai 2023',
            items: 4,
            shippingAddress: 'Rue Didouche Mourad, Constantine, Algérie',
            statusHistory: [
              { status: 'Commande reçue', date: '2 Mai 2023, 16:45' },
              { status: 'Paiement confirmé', date: '2 Mai 2023, 16:50' },
              { status: 'Annulée par le client', date: '3 Mai 2023, 10:15' }
            ]
          });
        } else {
          setOrderStatus({
            status: 'not-found',
            orderNumber: orderCode,
            date: '',
            items: 0
          });
        }
      } else {
        setOrderStatus({
          status: 'not-found',
          orderNumber: orderCode,
          date: '',
          items: 0
        });
      }
      
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
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