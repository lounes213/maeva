'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiTruck } from 'react-icons/fi';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ConfirmPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    try {
      const orderData = localStorage.getItem('lastOrder');
      if (!orderData) {
        return;
      }
      
      const parsedData = JSON.parse(orderData);
      if (!parsedData || !parsedData.trackingCode) {
        throw new Error('Données de commande invalides');
      }
      
      setOrderDetails(parsedData);
    } catch (error) {
      console.error('Erreur lors de la récupération des données de commande:', error);
      toast.error('Erreur lors de la récupération des données de commande');
      router.push('/cart');
    }
  }, [router]);

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Aucune commande trouvée</p>
          <Link href="/" className="text-amber-600 hover:text-amber-800 mt-4 inline-block">
            Retourner à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-8">
            <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-3xl font-bold text-gray-900 mt-4">Commande Confirmée!</h1>
            <p className="text-gray-600 mt-2">
              Merci pour votre commande. Votre numéro de suivi est :
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-2">{orderDetails.trackingCode}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 my-8">
            <h2 className="text-xl font-semibold mb-4">Détails de la livraison</h2>
            <div className="text-gray-600">
              <p>Nom: {orderDetails.customer?.name}</p>
              <p>Adresse: {orderDetails.customer?.address}</p>
              <p>Contact: {orderDetails.customer?.contact}</p>
              <p>Méthode de livraison: {orderDetails.shipping?.method}</p>
              <p className="mt-2 flex items-center justify-center gap-2">
                <FiTruck className="text-amber-600" />
                <span>Livraison estimée: {orderDetails.shipping?.estimatedDelivery}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Link 
              href={`/trackOrder/${orderDetails.trackingCode}`}
              className="block w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-700 transition-colors"
            >
              Suivre ma commande
            </Link>
            
            <Link 
              href="/"
              className="block w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
