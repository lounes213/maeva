'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Link from 'next/link';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  interface User {
    given_name: string;
    [key: string]: any; // Add this if there are additional properties
  }

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth/me'); // Endpoint to get user info
        setIsAuthenticated(true);
        setUser(response.data);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center px-6 py-12">
      <div className="grid max-w-6xl w-full gap-8 md:grid-cols-2 items-center">
        
        {/* Left Side - Text */}
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
            Bienvenue chez <span className="text-amber-600">MAIVA</span> Boutique
          </h1>

          <p className="text-gray-600 text-lg">
            Bienvenue {isAuthenticated ? user?.given_name : 'visiteur'} 👋. <br />
            Découvrez notre collection exclusive et profitez d'une expérience de shopping inoubliable !
          </p>

          <div className="flex flex-wrap gap-4">
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await axios.post('/admin/logout'); // Endpoint to log out
                  setIsAuthenticated(false);
                  setUser(null);
                }}
                className="inline-flex items-center justify-center rounded-lg bg-red-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-red-700 transition"
              >
                Se déconnecter
              </button>
            ) : (
              <>
                <button
                  onClick={() => (window.location.href = '/admin/login')}
                  className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-6 py-3 text-white font-semibold shadow-md hover:bg-amber-300 transition"
                >
                  Se connecter
                </button>

                <button
                  onClick={() => (window.location.href = '/admin/register')}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-gray-700 font-semibold shadow-md hover:bg-gray-100 transition"
                >
                  Créer un compte
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side - Image */}
        <div className="relative w-full h-[400px] md:h-[500px]">
          <Image
            src="/logo.png"
            alt="Welcome to MAIVA Boutique"
            layout="fill"
            objectFit="cover"
            className="rounded-2xl shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
}

