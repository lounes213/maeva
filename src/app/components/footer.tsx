import Link from 'next/link';
import React from 'react';
import Image from 'next/image';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ModernButton } from '@/components/ui/modern-button';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      {/* Newsletter Section Removed */}
      
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="MAEVA Logo"
                width={150}
                height={60}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6">
              MAEVA est une marque algérienne spécialisée dans la création de vêtements traditionnels modernisés, alliant savoir-faire artisanal et design contemporain.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-500 transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Liens Rapides</h4>
            <ul className="space-y-4">
              {[
                { href: '/shop', label: 'Boutique' },
                { href: '/collections', label: 'Collections' },
                { href: '/blog', label: 'Blog' },
                { href: '/about', label: 'À propos' },
                { href: '/contact', label: 'Contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-amber-500 transition-colors flex items-center group"
                  >
                    <ArrowRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Service Client</h4>
            <ul className="space-y-4">
              {[
                { href: '/faq', label: 'FAQ' },
                { href: '/shipping', label: 'Livraison & Retours' },
                { href: '/terms', label: 'Conditions Générales' },
                { href: '/privacy', label: 'Politique de Confidentialité' },
                { href: '/track-order', label: 'Suivi de Commande' },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-amber-500 transition-colors flex items-center group"
                  >
                    <ArrowRight size={16} className="mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  حي اولاد البطولة<br />
                  عمر خوجة البويرة<br />
                  Algérie
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                <a href="mailto:vviva1069@gmail.com" className="text-gray-400 hover:text-amber-500 transition-colors">
                  vviva1069@gmail.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-amber-500 mr-3 flex-shrink-0" />
                <a href="tel:+213559050962" className="text-gray-400 hover:text-amber-500 transition-colors">
                  +213 559 050 962
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="border-t border-gray-800 pt-8 pb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">
              © {currentYear} MAEVA. Tous droits réservés.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 text-sm">Moyens de paiement acceptés:</span>
              <div className="flex space-x-2">
                {['visa.svg', 'mastercard.svg', 'paypal.svg', 'edahabia.svg'].map((card) => (
                  <div key={card} className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center">
                    <Image 
                      src={`/images/payment/${card}`} 
                      alt={card.replace('.svg', '')} 
                      width={24} 
                      height={16}
                      className="h-4 w-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}