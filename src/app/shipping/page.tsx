'use client';

import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import { Truck, RefreshCw, Clock, MapPin } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center font-serif">Livraison & Retours</h1>
          
          {/* Shipping Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <Truck className="w-6 h-6 text-amber-600 mr-2" />
              Informations de Livraison
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Délais de Livraison</h3>
              <p className="text-gray-600 mb-4">
                Chez MAEVA, nous nous efforçons de vous livrer vos commandes le plus rapidement possible. Voici nos délais de livraison estimés :
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600"><strong>Alger et environs :</strong> 1-2 jours ouvrables</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600"><strong>Grandes villes :</strong> 2-3 jours ouvrables</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600"><strong>Autres régions :</strong> 3-5 jours ouvrables</span>
                </li>
              </ul>
              
              <p className="text-gray-600">
                Veuillez noter que ces délais sont donnés à titre indicatif et peuvent varier en fonction des conditions météorologiques, des jours fériés ou d'autres circonstances exceptionnelles.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Frais de Livraison</h3>
              <p className="text-gray-600 mb-4">
                Les frais de livraison sont calculés en fonction de votre localisation et du poids total de votre commande :
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600"><strong>Alger :</strong> 500 DA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600"><strong>Grandes villes :</strong> 700 DA</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600"><strong>Autres régions :</strong> 900 DA</span>
                </li>
              </ul>
              
              <p className="text-gray-600 mb-4">
                <strong>Livraison gratuite</strong> pour toute commande supérieure à 10 000 DA.
              </p>
              
              <p className="text-gray-600">
                Les frais de livraison exacts seront calculés et affichés lors du processus de paiement.
              </p>
            </div>
          </section>
          
          {/* Returns Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
              <RefreshCw className="w-6 h-6 text-amber-600 mr-2" />
              Politique de Retours
            </h2>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <p className="text-gray-600 mb-6">
                Nous voulons que vous soyez entièrement satisfait(e) de votre achat. Si pour une raison quelconque vous n'êtes pas satisfait(e), nous acceptons les retours dans les conditions suivantes :
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <Clock className="w-5 h-5 text-amber-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Délai de Retour</h3>
                  </div>
                  <p className="text-gray-600">
                    Vous disposez de 30 jours à compter de la date de réception pour nous retourner votre article.
                  </p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-amber-600 mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">Conditions</h3>
                  </div>
                  <p className="text-gray-600">
                    Les articles doivent être dans leur état d'origine, non portés, non lavés, avec toutes les étiquettes attachées.
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">Procédure de Retour</h3>
              <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-600">
                <li>Contactez notre service client par email ou téléphone pour informer de votre souhait de retour.</li>
                <li>Nous vous enverrons un formulaire de retour à remplir.</li>
                <li>Emballez soigneusement l'article avec le formulaire de retour complété.</li>
                <li>Envoyez le colis à l'adresse indiquée sur le formulaire.</li>
                <li>Une fois le retour reçu et vérifié, nous procéderons au remboursement dans un délai de 7 jours ouvrables.</li>
              </ol>
              
              <div className="bg-amber-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Frais de Retour</h3>
                <p className="text-gray-600">
                  Les frais de retour sont à la charge du client, sauf en cas d'erreur de notre part (article défectueux ou erreur d'expédition).
                </p>
              </div>
            </div>
          </section>
          
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Des questions sur votre livraison ou retour ?</h2>
            <p className="text-gray-600 mb-6">Notre équipe est là pour vous aider.</p>
            <a 
              href="/contact" 
              className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Contactez-nous
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}