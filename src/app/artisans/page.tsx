import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos Artisans | Maiva',
  description: 'Découvrez les artisans talentueux derrière nos créations uniques.',
};

export default function ArtisansPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Nos Artisans</h1>
      
      <div className="max-w-4xl mx-auto">
        <p className="text-lg text-gray-700 mb-8 text-center">
          Découvrez les artisans talentueux qui créent nos produits avec passion et savoir-faire.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Placeholder for artisan profiles - to be populated with real data */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Contenu en cours de création</h2>
              <p className="text-gray-600">
                Nous travaillons actuellement sur cette page pour vous présenter nos artisans.
                Revenez bientôt pour découvrir leurs histoires et leur savoir-faire.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}