'use client';

import DashboardHeader from '@/app/dashboard/components/DashboardHeader'
import React, { useEffect, useState } from 'react'
import OrderTable from './components/orderTable'

export default function OrdersPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('https://maeva-three.vercel.app/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <DashboardHeader user={user} />
      
      <div className="p-10 mt-16 bg-gray-100 min-h-screen">
        <div>
          <OrderTable />
        </div>
      </div>
    </div>
  )
}