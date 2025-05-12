'use client';

import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center font-serif">Politique de Confidentialité</h1>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : 1er Juin 2023
            </p>
            
            <p className="text-gray-600 mb-6">
              Chez MAEVA, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre site web et nos services.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Informations que nous collectons</h2>
            <p className="text-gray-600 mb-4">
              Nous pouvons collecter les types d'informations suivants :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">
              <li><strong>Informations personnelles :</strong> nom, prénom, adresse email, numéro de téléphone, adresse postale.</li>
              <li><strong>Informations de paiement :</strong> coordonnées bancaires (traitées de manière sécurisée par nos prestataires de paiement).</li>
              <li><strong>Informations de navigation :</strong> adresse IP, type de navigateur, pages visitées, temps passé sur le site.</li>
              <li><strong>Préférences :</strong> historique d'achats, produits consultés, préférences de communication.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Comment nous utilisons vos informations</h2>
            <p className="text-gray-600 mb-4">
              Nous utilisons vos informations pour :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">
              <li>Traiter et livrer vos commandes</li>
              <li>Gérer votre compte client</li>
              <li>Vous informer sur l'état de vos commandes</li>
              <li>Améliorer nos produits et services</li>
              <li>Personnaliser votre expérience sur notre site</li>
              <li>Vous envoyer des communications marketing (avec votre consentement)</li>
              <li>Prévenir la fraude et assurer la sécurité de notre site</li>
              <li>Respecter nos obligations légales</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Partage de vos informations</h2>
            <p className="text-gray-600 mb-4">
              Nous ne vendons jamais vos données personnelles à des tiers. Nous pouvons partager vos informations avec :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">
              <li><strong>Prestataires de services :</strong> transporteurs, services de paiement, hébergeurs web.</li>
              <li><strong>Partenaires commerciaux :</strong> uniquement avec votre consentement explicite.</li>
              <li><strong>Autorités légales :</strong> en cas d'obligation légale ou pour protéger nos droits.</li>
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Sécurité des données</h2>
            <p className="text-gray-600 mb-4">
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction. Toutes les transactions de paiement sont cryptées à l'aide de la technologie SSL.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Conservation des données</h2>
            <p className="text-gray-600 mb-4">
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour les finalités pour lesquelles elles ont été collectées, y compris pour satisfaire à toute exigence légale, comptable ou de reporting.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Cookies et technologies similaires</h2>
            <p className="text-gray-600 mb-4">
              Nous utilisons des cookies et des technologies similaires pour améliorer votre expérience sur notre site, analyser notre trafic et personnaliser notre contenu. Vous pouvez contrôler l'utilisation des cookies via les paramètres de votre navigateur.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Vos droits</h2>
            <p className="text-gray-600 mb-4">
              Conformément à la législation applicable, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l'effacement (droit à l'oubli)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d'opposition au traitement</li>
              <li>Droit de retirer votre consentement à tout moment</li>
            </ul>
            <p className="text-gray-600 mb-4">
              Pour exercer ces droits, veuillez nous contacter par email à vviva1069@gmail.com ou par courrier à notre adresse postale.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Modifications de notre politique de confidentialité</h2>
            <p className="text-gray-600 mb-4">
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Toute modification sera publiée sur cette page avec une date de mise à jour révisée. Nous vous encourageons à consulter régulièrement cette page pour rester informé des changements.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Contact</h2>
            <p className="text-gray-600 mb-4">
              Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en matière de protection des données, veuillez nous contacter :
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 text-gray-600">
              <li>Email : vviva1069@gmail.com</li>
              <li>Téléphone : +213 559 050 962</li>
              <li>Adresse : حي اولاد البطولة عمر خوجة البويرة, Algérie</li>
            </ul>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Pour exercer vos droits ou pour toute question concernant vos données personnelles, contactez-nous :
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:vviva1069@gmail.com" 
                className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                vviva1069@gmail.com
              </a>
              <a 
                href="/contact" 
                className="inline-block px-6 py-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
              >
                Formulaire de contact
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}