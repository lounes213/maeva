import { FiAward, FiTruck, FiShield, FiHeart, FiMapPin, FiUsers } from 'react-icons/fi';
import { FaInstagram, FaFacebook, FaTwitter, FaTiktok } from 'react-icons/fa';
import Image from 'next/image';
import Navigation from '../components/header';

export default function AboutPage() {
  const stats = [
    { value: '5,000+', label: 'Clients Satisfaits', icon: <FiUsers className="w-8 h-8 text-amber-600" /> },
    { value: '15+', label: 'Ans d\'Expérience', icon: <FiAward className="w-8 h-8 text-amber-600" /> },
    { value: '30+', label: 'Artisans Locaux', icon: <FiHeart className="w-8 h-8 text-amber-600" /> },
    { value: '100%', label: 'Fabriqué en Algérie', icon: <FiMapPin className="w-8 h-8 text-amber-600" /> },
  ];

  const teamMembers = [
    {
      name: 'Rachell.A',
      role: 'Fondatrice& Directrice',
      image: '/logo.png',
      bio: 'Passionnée par le Design algérien, Rachell a créé MAEVA pour valoriser l\'artisanat local.'
    },
 
  ];

  const values = [
    {
      icon: <FiHeart className="w-8 h-8 text-amber-600" />,
      title: 'Authenticité',
      description: 'Nous préservons les techniques artisanales ancestrales'
    },
    {
      icon: <FiAward className="w-8 h-8 text-amber-600" />,
      title: 'Excellence',
      description: 'Un savoir-faire reconnu pour sa qualité exceptionnelle'
    },
    {
      icon: <FiShield className="w-8 h-8 text-amber-600" />,
      title: 'Éthique',
      description: 'Commerce équitable et rémunération juste de nos artisans'
    },
    {
      icon: <FiTruck className="w-8 h-8 text-amber-600" />,
      title: 'Engagement',
      description: 'Livraison soignée et service client dédié'
    }
  ];

  return (
    <div className="bg-white">
      <Navigation />
      
    {/* Hero Section with Algerian Pattern and Decorative Shape */}
<div className="relative h-[100vh] overflow-hidden bg-gradient-to-r from-amber-900 to-amber-700 text-white">
  {/* Background Pattern */}
  <div className="absolute inset-0 bg-[url('/images/geometric-pattern.png')] opacity-10 z-0" />

  {/* Overlay Image */}
  <Image 
    src="/images/image1.jpg"
    alt="Modèle MAEVA"
    fill
    className="object-cover object-center mix-blend-overlay opacity-70 z-0"
    priority
  />

  {/* Content */}
  <div className="relative z-10 flex items-center h-full">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif drop-shadow-lg">
        Notre Histoire
      </h1>
      <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
        L'Élégance Algérienne Réinventée à travers nos créations uniques
      </p>
    </div>
  </div>

  {/* Decorative Bottom Shape */}
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
      d="M0,288L60,272C120,256,240,224,360,197.3C480,171,600,149,720,160C840,171,960,213,1080,218.7C1200,224,1320,192,1380,176L1440,160L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
    ></path>
  </svg>
</div>


      {/* Stats Section */}
      <div className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-center mb-4">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-amber-600">{stat.value}</p>
                <p className="mt-2 text-lg text-gray-700">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About Content */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="lg:flex gap-16 items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                <Image
                  src="/images/image5.jpg"
                  alt="Artisan MAEVA au travail"
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <p className="text-sm">Notre atelier à Alger - 2023</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 font-serif">
                MAEVA : <span className="text-amber-600">L'Héritage en Mouvement</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Fondée en 2010 Bouira, MAEVA puise son inspiration dans le riche patrimoine vestimentaire algérien,
                tout en y insufflant une touche contemporaine. Chaque pièce raconte une histoire, mêlant tradition et modernité.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Nos créations sont le fruit d'une collaboration étroite avec des artisans locaux qui perpétuent des savoir-faire
                ancestaux, tout en les adaptant aux exigences de la mode actuelle.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <div key={index} className="flex items-start p-4 bg-amber-50 rounded-lg">
                    <div className="flex-shrink-0 mr-4">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{value.title}</h3>
                      <p className="text-gray-600">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Directrice <span className="text-amber-600">MAEVA</span></h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Passionnés par la mode algérienne et engagés pour sa promotion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {teamMembers.map((member, index) => (
              <div key={index} className="text-center group">
                <div className="relative h-80 w-full mx-auto mb-6 rounded-xl overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                    <div className="text-left">
                      <h3 className="text-xl font-bold text-white">{member.name}</h3>
                      <p className="text-amber-200">{member.role}</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 px-4">{member.bio}</p>
                <div className="flex justify-center space-x-4">
                  <a href="https://www.instagram.com/maevaweddingdz?igsh=MXB5cnVvY3drNThyMw==" className="text-gray-500 hover:text-amber-600 transition-colors">
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a href="src/app/contact/page.tsx" className="text-gray-500 hover:text-amber-600 transition-colors">
                    <FaFacebook className="w-5 h-5" />
                  </a>
                  <a href="https://www.tiktok.com/@mava.wedding.dz?_t=ZM-8vh8jPv2EkA&_r=1" className="text-gray-500 hover:text-amber-600 transition-colors">
                    <FaTiktok className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Artisan Process */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-serif">Savoir-Faire <span className="text-amber-600">Artisanal</span></h2>
            <div className="w-24 h-1 bg-amber-600 mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez le processus minutieux derrière chaque création MAEVA
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Sélection des Matériaux",
                description: "Tissus 100% naturels provenant de régions algériennes",
                image: "/images/picture(1).jpg"
              },
              {
                title: "Broderie Traditionnelle",
                description: "Motifs inspirés du patrimoine algérien, cousus main",
                image: "/images/picture(2).jpg"
              },
              {
                title: "Contrôle Qualité",
                description: "Vérification minutieuse de chaque pièce avant expédition",
                image: "/images/picture(3).jpg"
              }
            ].map((step, index) => (
              <div key={index} className="group">
                <div className="relative h-64 mb-4 rounded-xl overflow-hidden">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                  <span className="absolute top-4 left-4 bg-white text-amber-600 px-3 py-1 rounded-full text-sm font-medium">
                    Étape {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-amber-700 to-amber-600 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 font-serif">Prêt à Découvrir l'Élégance MAEVA ?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Explorez notre collection exclusive ou prenez rendez-vous avec notre équipe
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="/shop" 
              className="px-8 py-3 bg-white text-amber-700 font-medium rounded-lg hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              Voir la Collection
            </a>
            <a 
              href="/contact" 
              className="px-8 py-3 border-2 border-white text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
            >
              Contactez-Nous
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}