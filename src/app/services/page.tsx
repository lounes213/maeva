// app/services/page.tsx
import { FiTruck, FiCreditCard, FiRefreshCw, FiShield, FiGift, FiHeadphones } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import Navigation from '../components/header';
import Footer from '../components/footer';

export const metadata = {
  title: 'Services - MAEVA | Vêtements Algériens de Qualité',
  description: 'Découvrez nos services exceptionnels : livraison rapide, paiement sécurisé, retours faciles sous 30 jours',
};

export default function ServicesPage() {
  const services = [
    {
      icon: <FiTruck className="w-10 h-10 text-amber-600" />,
      title: "Livraison Rapide",
      description: "Expédition sous 24h et livraison en 2-3 jours partout en Algérie",
      features: [
        "Suivi de colis en temps réel",
        "Livraison express disponible",
        "Points relais dans toutes les wilayas"
      ]
    },
    {
      icon: <FiCreditCard className="w-10 h-10 text-amber-600" />,
      title: "Paiement Sécurisé",
      description: "Plusieurs options de paiement adaptées à vos besoins",
      features: [
        "Paiement à la livraison",
        "Paiement en boutique",
        "Cartes bancaires sécurisées"
      ]
    },
    {
      icon: <FiRefreshCw className="w-10 h-10 text-amber-600" />,
      title: "Retours Faciles",
      description: "Retours acceptés sous 30 jours sans poser de questions",
      features: [
        "Processus simplifié",
        "Remboursement rapide",
        "Échange immédiat possible"
      ]
    },
    {
      icon: <FiShield className="w-10 h-10 text-amber-600" />,
      title: "Qualité Garantie",
      description: "Vêtements 100% algériens et fabriqués avec soin",
      features: [
        "Matériaux premium",
        "Confection artisanale",
        "Contrôle qualité rigoureux"
      ]
    },
    {
      icon: <FiGift className="w-10 h-10 text-amber-600" />,
      title: "Cadeaux & Surprises",
      description: "Emballage cadeau offert pour toutes vos commandes",
      features: [
        "Message personnalisé",
        "Emballage premium",
        "Options cadeaux spéciales"
      ]
    },
    {
      icon: <FiHeadphones className="w-10 h-10 text-amber-600" />,
      title: "Support Client",
      description: "Assistance 7j/7 pour répondre à toutes vos questions",
      features: [
        "WhatsApp, téléphone et email",
        "Conseils stylisme",
        "Aide aux tailles"
      ]
    }
  ];

  const testimonials = [
    {
      quote: "MAEVA a transformé ma façon de m'habiller avec des pièces authentiques. La qualité est exceptionnelle !",
      author: "Anonym",
      role: "Client fidèle depuis 2 ans",
      image: "/images/user.svg"
    },
    {
      quote: "Les retours sont si simples avec MAEVA. J'ai pu échanger une taille sans aucun problème.",
      author: "Anonym",
      role: "Nouveau client",
      image: "/images/user.svg"
    },
    {
      quote: "Livraison ultra rapide même dans ma région éloignée. Je recommande vivement !",
      author: "Anonym",
      role: "Client de Tamanrasset",
      image: "/images/user.svg"
    }
  ];

  return (
    <div className="bg-white">
      {/* Navigation */}
      <Navigation />
      {/* Hero Section */}
<div className="relative bg-gradient-to-r from-amber-900 to-amber-300 text-white overflow-hidden">
  <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center min-h-screen pt-20 md:pt-32">
    
    {/* Left Content */}
    <div className="md:w-1/2 text-center md:text-left space-y-6">
      <h1 className="text-4xl md:text-5xl font-bold leading-tight drop-shadow-lg">
        Nos Services Exceptionnels
      </h1>
      <p className="text-lg md:text-xl opacity-90 max-w-xl mx-auto md:mx-0">
        Chez <strong>MAEVA</strong>, nous nous engageons à vous offrir une expérience d'achat inoubliable pour vos vêtements algériens préférés.
      </p>
      <div className="flex flex-col md:flex-row justify-center md:justify-start gap-4 mt-4">
        <Link 
          href="/shop" 
          className="px-6 py-3 bg-white text-amber-900 font-semibold rounded-lg hover:bg-gray-100 transition"
        >
          Découvrir la collection
        </Link>
        <Link 
          href="/contact" 
          className="px-6 py-3 border border-white text-white font-medium rounded-lg hover:bg-white/10 transition"
        >
          Nous contacter
        </Link>
      </div>
    </div>

    {/* Right Image */}
    <div className="md:w-1/2 mb-12 md:mb-0 opacity-25">
      <Image 
        src="/images/service.png" 
        alt="Livraison MAEVA" 
        width={600} 
        height={400} 
        className="rounded-xl shadow-2xl mx-auto"
      />
    </div>
  </div>

  {/* Decorative Shape */}
  <svg
    className="absolute bottom-0 left-0 w-full"
    viewBox="0 0 1440 320"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <path
      fill="#fff"
      fillOpacity="1"
      d="M0,224L60,208C120,192,240,160,360,170.7C480,181,600,235,720,234.7C840,235,960,181,1080,165.3C1200,149,1320,171,1380,181.3L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
    ></path>
  </svg>
</div>


      {/* Services Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir MAEVA ?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous allons au-delà de la simple vente pour vous offrir une expérience complète
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-amber-100 p-4 rounded-full">
                    {service.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-center mb-4">{service.title}</h3>
                <p className="text-gray-600 text-center mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Process */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Processus de Commande</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              De la commande à votre domicile, en toute simplicité
            </p>
          </div>

          <div className="relative">
            {/* Timeline */}
            <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gray-200"></div>
            
            <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
              {[
                {
                  step: "1",
                  title: "Commande en ligne",
                  description: "Parcourez notre collection et passez commande en quelques clics",
                  icon: "🛒"
                },
                {
                  step: "2",
                  title: "Confirmation & Préparation",
                  description: "Nous préparons votre colis avec soin sous 24h",
                  icon: "📦"
                },
                {
                  step: "3",
                  title: "Livraison Express",
                  description: "Recevez votre commande en 2-3 jours ouvrés",
                  icon: "🚚"
                }
              ].map((item, index) => (
                <div key={index} className="relative text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start items-center mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 font-bold text-xl">
                      {item.icon}
                    </div>
                    <div className="lg:hidden ml-4 text-left">
                      <span className="text-sm text-amber-600">Étape {item.step}</span>
                      <h3 className="text-lg font-medium">{item.title}</h3>
                    </div>
                  </div>
                  <div className="lg:pl-16">
                    <div className="hidden lg:block">
                      <span className="text-sm text-amber-600">Étape {item.step}</span>
                      <h3 className="text-lg font-medium mt-1">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 mt-2">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ce que disent nos clients</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              La satisfaction de notre communauté est notre plus grande fierté
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-center mb-6">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden mr-4">
                    <Image 
                      src={testimonial.image}
                      alt={testimonial.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.author}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-amber-900 to-amber-400 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à découvrir la mode algérienne ?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Rejoignez des milliers de clients satisfaits par la qualité de nos vêtements et services
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/shop" 
              className="px-8 py-3 bg-white text-amber-900 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Explorer la collection
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Poser une question
            </Link>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}