'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { BiCartAlt, BiPackage } from 'react-icons/bi';
import { useCart } from '@/app/context/cartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const { totalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/shop', label: 'Boutique' },
    { href: '/about', label: 'À propos' },
    { href: '/services', label: 'Services' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: 'Contact' },
  ];

  const isActive = (href: string) => pathname === href;

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      router.push(`/trackOrder/${trackingCode.trim()}`);
      setTrackingOpen(false);
      setTrackingCode('');
    }
  };

  return (
    <header className="bg-white text-black shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={100}
              height={40}
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`hover:text-indigo-500 transition font-medium ${isActive(link.href) ? 'text-indigo-600 font-semibold' : ''}`}
              >
                {link.label}
              </Link>
            ))}

            {/* Track Order Button */}
            <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 text-gray-800 hover:text-indigo-500 transition font-medium">
                  <BiPackage className="w-5 h-5" />
                  <span>Suivi de commande</span>
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

            {/* Cart */}
            <Link href="/cart" className="relative ml-4 group">
              <BiCartAlt className="w-7 h-7 text-gray-800 hover:text-indigo-500 transition" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs w-5 h-5 flex items-center justify-center text-white rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="md:hidden bg-white px-4 pt-4 pb-6 space-y-2 shadow">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`block py-2 font-medium ${isActive(link.href) ? 'text-indigo-600' : 'text-gray-800'} hover:text-indigo-500`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile Track Order */}
          <button
            onClick={() => {
              setMobileOpen(false);
              setTrackingOpen(true);
            }}
            className="flex items-center gap-2 py-2 font-medium text-gray-800 hover:text-indigo-500 w-full"
          >
            <BiPackage className="w-5 h-5" />
            <span>Suivi de commande</span>
          </button>

          {/* Mobile Cart */}
          <Link
            href="/cart"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 py-2 font-medium text-gray-800 hover:text-indigo-500"
          >
            <BiCartAlt className="w-5 h-5" />
            <span>Panier {totalItems > 0 && `(${totalItems})`}</span>
          </Link>
        </div>
      )}
    </header>
  );
}