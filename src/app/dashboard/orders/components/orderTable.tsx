'use client';
import { useEffect, useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiClock, FiEdit, FiTrash2, FiTruck, FiXCircle, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  size?: string;
  color?: string;
}

interface Order {
  _id: string;
  id: string;
  items: OrderItem[];
  customer: {
    name: string;
    address: string;
    contact: string;
    email?: string;
  };
  shipping: {
    method: string;
    cost: number;
    estimatedDelivery: string;
  };
  payment: {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
    method?: string;
  };
  trackingCode: string;
  deliveryStatus: string;
  createdAt: string;
}

const statusOptions = ['processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'];

export default function OrderTable() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('https://maeva-three.vercel.app/api/orders');
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch orders');
        }
        
        // Ensure each order has an _id property
        const processedOrders = (data.data || []).map((order: any) => ({
          ...order,
          _id: order._id || order.id // Use _id if available, otherwise use id
        }));
        
        setOrders(processedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => 
    order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const updateStatus = async (id: string, newStatus: string) => {
    if (!id) {
      toast.error("ID de commande manquant");
      return;
    }

    setIsUpdating(true);
    try {
      const res = await fetch(`https://maeva-three.vercel.app/api/orders?id=${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          deliveryStatus: newStatus 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Échec de la mise à jour');
      }

      setOrders(prev =>
        prev.map(order =>
          (order._id === id || order.id === id) ? { ...order, deliveryStatus: newStatus } : order
        )
      );
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      toast.error('Échec de la mise à jour du statut');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!id) {
      toast.error("ID de commande manquant");
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;

    try {
      const res = await fetch(`https://maeva-three.vercel.app/api/orders?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setOrders(prev => prev.filter(order => order._id !== id && order.id !== id));
        toast.success('Commande supprimée avec succès');
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Échec de la suppression');
      }
    } catch (error) {
      toast.error('Échec de la suppression de la commande');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'processing':
        return { 
          label: 'En préparation', 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-800', 
          icon: <FiClock className="text-sm" /> 
        };
      case 'shipped':
        return { 
          label: 'Expédiée', 
          bg: 'bg-blue-100', 
          text: 'text-blue-800', 
          icon: <FiTruck className="text-sm" /> 
        };
      case 'in_transit':
        return { 
          label: 'En transit', 
          bg: 'bg-indigo-100', 
          text: 'text-indigo-800', 
          icon: <FiTruck className="text-sm" /> 
        };
      case 'out_for_delivery':
        return { 
          label: 'En livraison', 
          bg: 'bg-purple-100', 
          text: 'text-purple-800', 
          icon: <FiTruck className="text-sm" /> 
        };
      case 'delivered':
        return { 
          label: 'Livrée', 
          bg: 'bg-green-100', 
          text: 'text-green-800', 
          icon: <FiCheckCircle className="text-sm" /> 
        };
      case 'cancelled':
        return { 
          label: 'Annulée', 
          bg: 'bg-red-100', 
          text: 'text-red-800', 
          icon: <FiXCircle className="text-sm" /> 
        };
      default:
        return { 
          label: status, 
          bg: 'bg-gray-100', 
          text: 'text-gray-600', 
          icon: <FiAlertCircle className="text-sm" /> 
        };
    }
  };

  if (loading) return <div className="text-center py-10">Chargement des commandes…</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700 text-center">Gestion des Commandes</h1>
      
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par client, code ou produit..."
          className="pl-10 pr-4 py-2 border rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Produit(s)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const statusStyle = getStatusStyle(order.deliveryStatus);
                const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);
                const orderId = order._id || order.id; // Use either _id or id
                
                return (
                  <tr key={orderId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={`${orderId}-item-${index}`} className="flex items-center">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-10 w-10 object-cover rounded mr-3"
                              />
                            ) : (
                              <div className="h-10 w-10 bg-gray-200 rounded mr-3 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">N/A</span>
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {item.name} × {item.quantity}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.price.toFixed(2)}DZA {item.size && `| ${item.size}`} {item.color && `| ${item.color}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {order.customer.name}
                      {order.customer.email && (
                        <div className="text-sm text-gray-500">{order.customer.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{order.customer.contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {order.payment.total.toFixed(2)}DZA
                      <div className="text-xs text-gray-500">
                        {totalItems} article{totalItems > 1 ? 's' : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-gray-900">{order.trackingCode}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`${statusStyle.bg} ${statusStyle.text} p-1 rounded-full`}>
                          {statusStyle.icon}
                        </span>
                        <select
                          value={order.deliveryStatus}
                          onChange={(e) => updateStatus(orderId, e.target.value)}
                          className={`border ${statusStyle.bg} ${statusStyle.text} rounded p-1 text-sm`}
                          disabled={isUpdating}
                        >
                          {statusOptions.map((status) => (
                            <option key={`${orderId}-status-${status}`} value={status} className="bg-white">
                              {getStatusStyle(status).label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => deleteOrder(orderId)}
                        className="text-red-600 hover:text-red-800 p-1 transition-colors"
                        title="Supprimer"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? 'Aucune commande correspondante' : 'Aucune commande trouvée'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}