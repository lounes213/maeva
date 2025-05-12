'use client';

import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center font-serif">Conditions Générales de Vente</h1>
          
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <p className="text-gray-600 mb-6">
              Dernière mise à jour : 1er Juin 2023
            </p>
            
            <p className="text-gray-600 mb-6">
              Bienvenue sur MAEVA. Veuillez lire attentivement les présentes conditions générales de vente avant d'utiliser notre site web ou de passer une commande. En accédant à notre site ou en passant une commande, vous acceptez d'être lié par ces conditions.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Les présentes Conditions Générales de Vente (ci-après "CGV") définissent les droits et obligations des parties dans le cadre de la vente en ligne de vêtements et accessoires proposés par MAEVA (ci-après "nous", "notre" ou "nos") au client (ci-après "vous" ou "votre").
            </p>
            <p className="text-gray-600 mb-4">
              MAEVA est une marque de vêtements traditionnels algériens modernisés, dont le siège social est situé à حي اولاد البطولة عمر خوجة البويرة, Algérie.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Commandes</h2>
            <p className="text-gray-600 mb-4">
              Pour passer une commande sur notre site, vous devez être âgé d'au moins 18 ans ou avoir l'autorisation d'un parent ou tuteur légal.
            </p>
            <p className="text-gray-600 mb-4">
              Une commande n'est définitivement confirmée qu'après acceptation du paiement et confirmation par email de notre part. Nous nous réservons le droit de refuser ou d'annuler toute commande pour des motifs légitimes, notamment en cas de problème d'approvisionnement, de litige existant avec le client, ou de suspicion de fraude.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Prix et Paiement</h2>
            <p className="text-gray-600 mb-4">
              Les prix de nos produits sont indiqués en Dinars Algériens (DA) toutes taxes comprises. Les frais de livraison sont facturés en supplément et indiqués avant la validation de la commande.
            </p>
            <p className="text-gray-600 mb-4">
              Nous acceptons les paiements par carte bancaire, PayPal, et paiement à la livraison. Le paiement est sécurisé et vos informations bancaires ne sont pas stockées sur notre site.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Livraison</h2>
            <p className="text-gray-600 mb-4">
              Nous livrons actuellement uniquement en Algérie. Les délais de livraison sont donnés à titre indicatif et peuvent varier en fonction de votre localisation et d'autres facteurs externes.
            </p>
            <p className="text-gray-600 mb-4">
              En cas de retard de livraison de plus de 7 jours par rapport au délai annoncé, vous pouvez annuler votre commande et demander un remboursement intégral.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Droit de Rétractation et Retours</h2>
            <p className="text-gray-600 mb-4">
              Conformément à la législation en vigueur, vous disposez d'un délai de 30 jours à compter de la réception de votre commande pour exercer votre droit de rétractation, sans avoir à justifier de motifs ni à payer de pénalités.
            </p>
            <p className="text-gray-600 mb-4">
              Pour exercer ce droit, veuillez nous contacter par email ou téléphone. Les frais de retour sont à votre charge, sauf en cas d'erreur de notre part (article défectueux ou erreur d'expédition).
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Garanties</h2>
            <p className="text-gray-600 mb-4">
              Tous nos produits bénéficient de la garantie légale de conformité et de la garantie contre les vices cachés. En cas de défaut de conformité constaté dans les 6 mois suivant la livraison, vous pouvez choisir entre la réparation ou le remplacement du produit.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Propriété Intellectuelle</h2>
            <p className="text-gray-600 mb-4">
              Tous les éléments du site MAEVA (textes, images, logos, etc.) sont protégés par le droit d'auteur et de propriété intellectuelle. Toute reproduction, même partielle, est strictement interdite sans notre autorisation préalable.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Protection des Données Personnelles</h2>
            <p className="text-gray-600 mb-4">
              Nous collectons et traitons vos données personnelles conformément à notre Politique de Confidentialité, disponible sur notre site. Vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Loi Applicable et Juridiction Compétente</h2>
            <p className="text-gray-600 mb-4">
              Les présentes CGV sont soumises au droit algérien. En cas de litige, une solution amiable sera recherchée avant toute action judiciaire. À défaut, les tribunaux algériens seront seuls compétents.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Modifications des CGV</h2>
            <p className="text-gray-600 mb-4">
              Nous nous réservons le droit de modifier les présentes CGV à tout moment. Les modifications prennent effet dès leur publication sur le site. Il vous appartient de consulter régulièrement cette page pour vous tenir informé des éventuelles modifications.
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Pour toute question concernant nos conditions générales de vente, veuillez nous contacter :
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a 
                href="mailto:vviva1069@gmail.com" 
                className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                vviva1069@gmail.com
              </a>
              <a 
                href="tel:+213559050962" 
                className="inline-block px-6 py-3 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
              >
                +213 559 050 962
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}