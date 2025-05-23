'use client';

import DashboardHeader from '@/app/dashboard/components/DashboardHeader'
import React, { useEffect, useState } from 'react'
import CollectionTable from './components/collectionTable'

function CollectionPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
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
    <div>
      <DashboardHeader user={user} />
      <div className="p-10">
        <span className="flex items-center">
          <span className="shrink-0 pe-4 text-gray-900">Categories</span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gray-300"></span>
        </span>
      </div>

      <section>
        <CollectionTable />
      </section>
    </div>
  )
}

export default CollectionPage