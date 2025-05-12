'use client';

import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "Comment passer une commande sur MAEVA ?",
      answer: "Pour passer une commande, parcourez notre boutique, sélectionnez les articles qui vous intéressent, ajoutez-les à votre panier, puis suivez les étapes du processus de paiement. Vous pouvez payer par carte bancaire, PayPal ou à la livraison."
    },
    {
      question: "Quels sont les délais de livraison ?",
      answer: "Nous livrons généralement en 2 à 5 jours ouvrables en Algérie. Les délais peuvent varier selon votre localisation. Vous recevrez un email de confirmation avec un numéro de suivi dès que votre commande sera expédiée."
    },
    {
      question: "Comment puis-je suivre ma commande ?",
      answer: "Vous pouvez suivre votre commande en utilisant le numéro de suivi fourni dans l'email de confirmation d'expédition. Vous pouvez également vous connecter à votre compte et consulter la section 'Mes commandes'."
    },
    {
      question: "Quelle est votre politique de retour ?",
      answer: "Nous acceptons les retours dans les 30 jours suivant la réception de votre commande. Les articles doivent être dans leur état d'origine, non portés et avec toutes les étiquettes attachées. Veuillez consulter notre page 'Livraison & Retours' pour plus de détails."
    },
    {
      question: "Comment prendre soin de mes vêtements MAEVA ?",
      answer: "Nous recommandons un lavage à la main délicat avec de l'eau froide pour la plupart de nos pièces. Évitez l'utilisation de javel et le séchage en machine. Chaque article est accompagné d'instructions d'entretien spécifiques sur son étiquette."
    },
    {
      question: "Proposez-vous des tailles personnalisées ?",
      answer: "Oui, nous proposons des services de personnalisation pour certaines de nos collections. Veuillez nous contacter directement par email ou téléphone pour discuter de vos besoins spécifiques et obtenir un devis."
    },
    {
      question: "Livrez-vous à l'international ?",
      answer: "Actuellement, nous livrons uniquement en Algérie. Nous travaillons à étendre nos services de livraison à d'autres pays dans un futur proche."
    },
    {
      question: "Comment puis-je contacter le service client ?",
      answer: "Vous pouvez nous contacter par email à vviva1069@gmail.com, par téléphone au +213 559 050 962, ou en utilisant le formulaire de contact sur notre site. Notre équipe est disponible du lundi au vendredi, de 9h à 17h."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center font-serif">Foire Aux Questions</h1>
          
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-amber-600 transform ${openIndex === index ? 'rotate-180' : ''} transition-transform duration-200`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96 py-4' : 'max-h-0 py-0'
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-gray-600 mb-6">Notre équipe est là pour vous aider avec toutes vos questions.</p>
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