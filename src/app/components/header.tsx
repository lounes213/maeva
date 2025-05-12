'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Package, Search, User, Menu, X, Heart, ChevronDown } from 'lucide-react';
import { useCart } from '@/app/context/cartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ModernButton } from '@/components/ui/modern-button';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/shop', label: 'Boutique' },
    { href: '/collections', label: 'Collections' },
    { href: '/about', label: 'À propos' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/trackOrder/${trackingCode.trim()}`);
      setTrackingOpen(false);
      setTrackingCode('');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-white py-3'}`}>
      {/* Top bar with announcement or secondary navigation */}
      <div className="bg-amber-600 text-white py-1.5 text-center text-sm font-medium">
        <p>Livraison gratuite à partir de 5000 DA d'achat | Paiement à la livraison disponible</p>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={48}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navLinks.map(link => (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={`hover:text-amber-600 transition font-medium flex items-center ${isActive(link.href) ? 'text-amber-600 font-semibold' : 'text-gray-800'}`}
                >
                  {link.label}
                  {link.children && <ChevronDown className="ml-1 w-4 h-4" />}
                </Link>
                
                {/* Dropdown for categories */}
                {link.children && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left group-hover:translate-y-0 translate-y-2">
                    <div className="py-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search */}
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Search className="w-5 h-5 text-gray-700" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Rechercher</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearch} className="mt-4">
                  <div className="flex items-center">
                    <Input
                      type="text"
                      placeholder="Que recherchez-vous ?"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" className="ml-2">
                      <Search className="w-4 h-4 mr-2" />
                      Rechercher
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Track Order */}
            <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
              <DialogTrigger asChild>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Package className="w-5 h-5 text-gray-700" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suivi de commande</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTrackOrder} className="space-y-4 mt-4">
                  <Input
                    type="text"
                    placeholder="Entrez votre numéro de suivi"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                  />
                  <Button type="submit" className="w-full">
                    Suivre la commande
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
              <Heart className="w-5 h-5 text-gray-700" />
            </Link>

            {/* Account link removed */}

            {/* Cart */}
            <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-xs w-5 h-5 flex items-center justify-center text-white rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 lg:hidden">
            <Link href="/cart" className="relative">
              <ShoppingBag className="w-6 h-6 text-gray-800" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-xs w-5 h-5 flex items-center justify-center text-white rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-800 p-1"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div 
        className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out transform lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: '0', paddingTop: '4rem' }}
      >
        <div className="h-full overflow-y-auto pb-20">
          <div className="px-4 py-6 space-y-6">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <ChevronDown className="w-4 h-4 text-gray-400 rotate-270" />
                </button>
              </div>
            </form>
            
            {/* Mobile nav links */}
            <nav className="space-y-4">
              {navLinks.map(link => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => !link.children && setMobileOpen(false)}
                    className={`block py-2 text-lg font-medium ${
                      isActive(link.href) ? 'text-amber-600' : 'text-gray-800'
                    }`}
                  >
                    {link.label}
                  </Link>
                  
                  {/* Mobile dropdown items */}
                  {link.children && (
                    <div className="pl-4 mt-2 space-y-2 border-l-2 border-gray-100">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-1 text-gray-600 hover:text-amber-600"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
            
            {/* Mobile actions */}
            <div className="space-y-4 border-t border-gray-200 pt-6 mt-6">
              {/* Account link removed */}
              
              <Link
                href="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="flex items-center py-2 text-gray-800"
              >
                <Heart className="w-5 h-5 mr-3" />
                <span>Mes favoris</span>
              </Link>
              
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setTrackingOpen(true);
                }}
                className="flex items-center py-2 text-gray-800 w-full"
              >
                <Package className="w-5 h-5 mr-3" />
                <span>Suivi de commande</span>
              </button>
            </div>
            
            {/* Contact info */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <p className="text-sm text-gray-500 mb-2">Besoin d'aide ?</p>
              <a href="tel:+213123456789" className="block py-2 text-amber-600 font-medium">
                +213 12 345 67 89
              </a>
              <a href="mailto:contact@maiva-shop.com" className="block py-2 text-amber-600 font-medium">
                contact@maiva-shop.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}