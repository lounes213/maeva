'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const OrderStatusForm = () => {
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    address: '',
    contact: '',
    email: ''
  });
  const router = useRouter();

  useEffect(() => {
    // Vérifier s'il y a un achat direct dans le sessionStorage
    const directBuyItem = sessionStorage.getItem('directBuyItem');
    if (directBuyItem) {
      const savedCustomerInfo = localStorage.getItem('customerInfo');
      if (savedCustomerInfo) {
        setCustomerInfo(JSON.parse(savedCustomerInfo));
        handleDirectBuy(JSON.parse(directBuyItem), JSON.parse(savedCustomerInfo));
      } else {
        toast.error('Veuillez d\'abord remplir vos informations de livraison');
        router.push('/cart');
      }
    }
  }, []);

  const handleDirectBuy = async (item: any, customerData: any) => {
    if (!customerData.name || !customerData.address || !customerData.contact) {
      toast.error('Veuillez remplir toutes les informations de livraison requises');
      router.push('/cart');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Traitement de votre commande...');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [item],
          customer: customerData,
          shipping: {
            method: 'standard',
            cost: 0,
            estimatedDelivery: '2-4 jours'
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création de la commande');
      }

      // Rediriger vers la page de confirmation avec l'ID de la commande
      sessionStorage.removeItem('directBuyItem');
      router.push('/confirm?orderId=' + data.data._id);
      toast.success('Commande créée avec succès', { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Erreur lors de la création de la commande', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderId(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Vérification du statut de la commande...');

    try {
      const res = await fetch(`/api/orders?id=${orderId}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setOrderStatus(data.order.deliveryStatus); // Set the order status
        toast.success('Commande trouvée', { id: toastId });
      } else {
        toast.error('Commande non trouvée', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur serveur', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-lg overflow-y-auto max-h-[90vh]">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Vérifier le statut de la commande</h1>
      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Order ID Input */}
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700">ID de la commande</label>
          <input
            type="text"
            name="orderId"
            value={orderId}
            onChange={handleChange}
            className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Entrez l'ID de la commande"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="col-span-2 flex justify-end gap-4 mt-6">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Vérification...' : 'Vérifier le statut'}
          </button>
        </div>
      </form>

      {/* Display Order Status */}
      {orderStatus && (
        <div className="mt-6">
          <h3 className="font-semibold">Statut de la commande:</h3>
          <p className="text-lg">{orderStatus}</p>
        </div>
      )}
    </div>
  );
};

export default OrderStatusForm;
