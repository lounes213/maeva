import Image from 'next/image';
import React from 'react';

export default function ThankYouPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Logo" width={50} height={50} className="rounded-full" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Merci pour votre Temps !
        </h1>
        <p className="text-gray-600 mb-6">
          Nous vous Souhaitons un bon Retour et une bonne vente !
        </p>
        <div className="border-t border-gray-200 mt-6 pt-4">
          <p className="text-gray-500">À très bientôt !</p>
        </div>
      </div>
    </div>
  );
}
