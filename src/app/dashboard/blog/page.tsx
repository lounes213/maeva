'use client';

import React, { useEffect, useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import CreateBlog from './components/createBlog';
import BlogTable from './components/blogTable';
const Page = () => {
  const [user, setUser] = useState<any>(null);

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
    <div className="p-4 space-y-8 mt-24">
      <DashboardHeader user={user} />
      <CreateBlog />
      <BlogTable />
    </div>
  );
};

export default Page;
