'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { ModernButton } from './modern-button';

interface HeroBannerProps {
  title: string;
  subtitle: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageSrc: string;
  imageAlt: string;
  backgroundPattern?: string;
  className?: string;
}

export function HeroBanner({
  title,
  subtitle,
  primaryButtonText,
  primaryButtonLink,
  secondaryButtonText,
  secondaryButtonLink,
  imageSrc,
  imageAlt,
  backgroundPattern = '/images/geometric-pattern.png',
  className = '',
}: HeroBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-b from-amber-50 to-white ${className}`}>
      {/* Background pattern */}
      <div 
        className="absolute inset-0 bg-repeat opacity-10 z-0" 
        style={{ backgroundImage: `url(${backgroundPattern})` }}
      />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col md:flex-row items-center">
        {/* Text Column */}
        <div 
          className={`md:w-1/2 text-center md:text-left mb-16 md:mb-0 transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight font-serif">
            {title.split(' ').map((word, i) => (
              <React.Fragment key={i}>
                {i > 0 && ' '}
                <span 
                  className={`inline-block transition-all duration-700 delay-${i * 100} transform ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  {word.includes('<amber>') ? (
                    <span className="text-amber-600">{word.replace('<amber>', '')}</span>
                  ) : (
                    word
                  )}
                </span>
              </React.Fragment>
            ))}
          </h1>
          <p 
            className="mt-6 text-xl text-gray-600 max-w-md mx-auto md:mx-0 transition-all duration-700 delay-500 transform"
            style={{ 
              transitionDelay: '500ms',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            {subtitle}
          </p>
          <div 
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start transition-all duration-700 delay-700"
            style={{ 
              transitionDelay: '700ms',
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)'
            }}
          >
            <Link href={primaryButtonLink}>
              <ModernButton 
                variant="primary" 
                size="lg" 
                leftIcon={<ShoppingBag className="w-5 h-5" />}
                className="shadow-lg hover:shadow-amber-200"
              >
                {primaryButtonText}
              </ModernButton>
            </Link>
            
            {secondaryButtonText && secondaryButtonLink && (
              <Link href={secondaryButtonLink}>
                <ModernButton 
                  variant="outline" 
                  size="lg" 
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  {secondaryButtonText}
                </ModernButton>
              </Link>
            )}
          </div>
        </div>

        {/* Image Column */}
        <div 
          className="md:w-1/2 relative transition-all duration-1000 delay-300 transform"
          style={{ 
            transitionDelay: '300ms',
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateX(0)' : 'translateX(50px)'
          }}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
            <Image 
              src={imageSrc} 
              alt={imageAlt} 
              width={600} 
              height={800} 
              className="w-full h-auto"
              priority
            />
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500 rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -top-6 -left-6 w-16 h-16 bg-amber-500 rounded-full opacity-20 blur-xl"></div>
          </div>
          
          {/* Floating badge */}
          <div className="absolute top-6 right-6 bg-white px-4 py-2 rounded-full shadow-lg transform rotate-3 animate-pulse">
            <span className="text-amber-600 font-bold">Nouvelle collection</span>
          </div>
        </div>
      </div>
      
      {/* Bottom wave shape */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg 
          viewBox="0 0 1440 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path 
            d="M0,64L60,80C120,96,240,128,360,138.7C480,149,600,139,720,122.7C840,107,960,85,1080,96C1200,107,1320,149,1380,170.7L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" 
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}