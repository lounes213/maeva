'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

function DashboardHeader({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/products', label: 'Products' },
    { href: '/dashboard/collection', label: 'Collection' },
    { href: '/dashboard/users', label: 'Utilisateurs' },
    { href: '/dashboard/contact', label: 'Contact' },
    { href: '/dashboard/blog', label: 'Blog' },
    { href: '/dashboard/orders', label: 'Orders' },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        router.push('/admin/merci'); // Redirection vers la page de remerciement
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="bg-white shadow fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link className="hidden md:flex items-center gap-2 text-teal-600" href="/">
            <img className="h-10 w-auto rounded-full" src="/logo.png" alt="Logo Maiva" />
          </Link>

          <div className="w-full md:w-auto flex items-center justify-between md:justify-end md:gap-12">
            <button
              onClick={toggleMenu}
              className="text-gray-800 md:hidden focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>

            <nav
              className={`${
                isMenuOpen ? "block" : "hidden"
              } md:block absolute left-0 right-0 top-16 bg-white shadow-lg md:shadow-none md:relative md:top-0`}
            >
              <ul className="space-y-4 md:space-y-0 md:flex md:space-x-6 p-4 md:p-0">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`block transition hover:text-gray-800 ${
                        pathname === link.href ? 'text-black font-semibold' : 'text-gray-500'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen((prev) => !prev)}
                  className="overflow-hidden rounded-full border border-gray-300 shadow-inner"
                >
                  <img
                    src={user?.picture || '/logo.png'}
                    alt="User avatar"
                    className="h-10 w-10 object-cover"
                  />
                </button>

                {isOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-56 divide-y divide-gray-100 rounded-md border bg-white shadow-lg">
                    <div className="p-4">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {user?.email ? user.email : 'Utilisateur'}
                      </p>
                      <p className="text-sm text-gray-500">{user?.role || 'Utilisateur'}</p>
                    </div>

                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 0 1 0 12h-3"
                          />
                        </svg>
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
