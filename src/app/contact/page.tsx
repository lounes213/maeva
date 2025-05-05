// app/contact/page.tsx
'use client';
import { FiMapPin, FiMail, FiPhone, FiSend } from 'react-icons/fi';
import { FaWhatsapp, FaInstagram, FaFacebookF, FaTiktok } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import Footer from '../components/footer';
import Navigation from '../components/header';
import { motion } from 'framer-motion';


// app/contact/page.tsx
const formSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string()
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres')
    .regex(/^[0-9]+$/, 'Le numéro de téléphone ne doit contenir que des chiffres'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  subject: z.string().optional(),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

type FormData = z.infer<typeof formSchema>;
const metadata = {
  title: 'Contact - MAEVA',
  description: 'Contactez notre équipe pour toutes vos questions',
};

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

// app/contact/page.tsx
const onSubmit = async (data: FormData) => {
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${data.firstName} ${data.lastName}`,
        phone: data.phone,
        email: data.email,
        subject: data.subject,
        message: data.message,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send message');
    }

    toast.success('Message envoyé avec succès!');
    reset();
  } catch (error: any) {
    toast.error(error.message || 'Une erreur est survenue. Veuillez réessayer.');
  }
};
  return (
    <div className="bg-white">
      <Navigation />
      
    <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-amber-100 to-amber-50 py-24 md:py-32 text-gray-900">
  {/* Decorative Algerian pattern (light and subtle) */}
  <div className="absolute inset-0 bg-[url('/images/geometric-pattern.png')] bg-repeat opacity-5 z-0" />

  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-12">
    
    {/* Left Content */}
    <motion.div
      className="md:w-1/2 space-y-6 text-center md:text-left"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <h1 className="text-4xl md:text-5xl font-bold leading-tight text-gray-900 font-serif">
        Nous sommes là pour vous aider
      </h1>
      <p className="text-lg text-gray-700 max-w-xl mx-auto md:mx-0">
        Que vous ayez des questions sur nos produits ou besoin d'assistance, notre équipe est à votre écoute.
      </p>
      <div className="flex flex-wrap justify-center md:justify-start gap-4">
        <Link 
          href="/shop" 
          className="px-6 py-3 border-2 border-amber-600 text-amber-600 rounded-full font-medium hover:bg-amber-50 transition-all"
        >
          Explorer notre collection
        </Link>
       
      </div>
    </motion.div>

    {/* Right Image with Responsive Gradient Blend */}
    <motion.div
      className="md:w-1/2 w-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.1 }}
    >
      <div className="relative w-full h-[500px] md:h-[400px] lg:h-[550px] overflow-hidden opacity-40 ">
        <Image
          src="/images/dessin1.jpg"
          alt="maeva"
          fill
          className="object-cover mix-blend-lighten opacity-90"
          priority
          sizes="(max-width: 768px) 100vw, 70vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-amber-200 to-white opacity-70 mix-blend-screen pointer-events-none" />
      </div>
    </motion.div>
  </div>

  {/* Wave Divider */}
  <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
    <svg
      viewBox="0 0 1440 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="w-full h-40"
    >
      <path
        fill="#ffffff"
        d="M0,96L60,106.7C120,117,240,139,360,128C480,117,600,75,720,74.7C840,75,960,117,1080,144C1200,171,1320,181,1380,186.7L1440,192V0H1380C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0H0Z"
      />
    </svg>
  </div>
</section>

 
      {/* Contact Information */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos coordonnées</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Plusieurs façons de nous contacter. Nous répondons généralement dans les 24 heures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { 
                icon: <FiMapPin className="w-8 h-8 text-amber-600" />,
                title: 'Visitez-nous',
                content: 'حي اولاد البطولة عمر خوجة البويرة',
                action: {
                  text: 'Voir sur la carte',
                  href: '#map'
                }
              },
              { 
                icon: <FiMail className="w-8 h-8 text-amber-600" />,
                title: 'Envoyez-nous un email',
                content: 'vviva1069@gmail.com',
                action: {
                  text: 'Envoyer un email',
                  href: 'vviva1069@gmail.com'
                }
              },
              { 
                icon: <FiPhone className="w-8 h-8 text-amber-600" />,
                title: 'Appelez-nous',
                content: '+33 1 23 45 67 89',
                action: {
                  text: 'Appeler maintenant',
                  href: 'tel:+33123456789'
                }
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-gray-50 p-8 rounded-xl hover:shadow-md transition-shadow duration-300 border border-gray-100"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-amber-50 rounded-full">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-center mb-2">{item.title}</h3>
                <p className="text-gray-600 text-center mb-4">{item.content}</p>
                <div className="text-center">
                  <Link 
                    href={item.action.href} 
                    className="text-amber-600 hover:text-amber-800 font-medium inline-flex items-center gap-1"
                  >
                    {item.action.text}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Social Media */}
          <div className="text-center mb-16">
            <h3 className="text-xl font-semibold mb-4">Suivez-nous sur les réseaux sociaux</h3>
            <div className="flex justify-center gap-4">
              {[
                { icon: <FaWhatsapp className="w-6 h-6" />, href: 'https://web.whatsapp.com/', color: 'bg-amber-500 hover:bg-green-600 text-white' },
                { icon: <FaTiktok className="w-6 h-6" />, href: 'https://www.tiktok.com/@mava.wedding.dz?_t=ZM-8vh8jPv2EkA&_r=1', color: 'bg-amber-500 hover:bg-green-600 text-white' },
                { icon: <FaInstagram className="w-6 h-6" />, href: 'https://www.instagram.com/maevaweddingdz?igsh=MXB5cnVvY3drNThyMw==', color: 'bg-amber-600 text-white hover:bg-pink-700' },
                { icon: <FaFacebookF className="w-6 h-6" />, href: 'https://www.facebook.com/share/1CGKXJDXmK/', color: 'bg-amber-600  text-white hover:bg-blue-700' },
              ].map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className={`${social.color} text-white p-3 rounded-full transition-colors duration-300`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div 
            id="contact-form" 
            className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-amber-600 text-white p-6">
              <h2 className="text-2xl font-bold text-center">Formulaire de contact</h2>
            </div>
            <div className="p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      Prénom *
                    </label>
                    <input
                      id="firstName"
                      {...register('firstName')}
                      className={`w-full px-4 py-3 border ${errors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nom *
                    </label>
                    <input
                      id="lastName"
                      {...register('lastName')}
                      className={`w-full px-4 py-3 border ${errors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                   {/* Add this after the name fields and before the email field */}
<div>
  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
    Téléphone *
  </label>
  <input
    id="phone"
    {...register('phone')}
    className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
    placeholder="0612345678"
  />
  {errors.phone && (
    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
  )}
</div>
</div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Sujet
                  </label>
                  <input
                    id="subject"
                    {...register('subject')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    {...register('message')}
                    className={`w-full px-4 py-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500`}
                  ></textarea>
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="flex justify-center">
                  <button
                    type="submit"
                    
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <FiSend />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="map" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Notre E-Shop</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Venez découvrir nos collections dans notre espace dédié. Nous serons ravis de vous accueillir et de vous conseiller.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
           <iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13192.203445715855!2d3.8819992!3d36.3755805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128ddad0d2ac2547%3A0xd2e36f5b8c9c1f28!2z2YXYsdmD2LIg2KfZhNmF2LXYp9mG2YjZiiDYp9mE2YXZh9in2K8g2KfZhNiv2YrZhtmHINin2YTYrtin2YY!5e0!3m2!1sar!2sdz!4v1714418162355!5m2!1sar!2sdz"
  width="100%"
  height="450"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  className="rounded-xl"
/>

          </div>
          <div className="mt-6 text-center">
            <Link 
              href="https://maps.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-amber-600 hover:text-amber-800 font-medium"
            >
              Obtenir l'itinéraire
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}