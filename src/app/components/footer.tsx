import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

export default function footer() {
  return (
    <div>
     {/* Footer Section */}
      <footer className="bg-white text-black py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
             {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={400}
              height={400}
              className="h-8 w-auto"
            />
          </Link>
            <p className="text-gray-400">
Concevez avec une extension flexible et élégante. Créez une publicité avec différents éléments.

            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Liens Utils</h4>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link href="/product" className="text-gray-400 hover:text-white">Nos Produits</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">A propos de Nous</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">A propos</Link></li>
              <li><Link href="/services" className="text-gray-400 hover:text-white">Services</Link></li>
              <li><Link href="shop" className="text-gray-400 hover:text-white">Boutique</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact</h4>
            <address className="text-gray-400 not-italic">
              حي اولاد البطولة<br />
               عمر خوجة البويرة<br />
              <br />
              vviva1069@gmail.com<br />
              +213559050962
            </address>
          </div>
        </div>
      </footer>
    </div>
  )
}