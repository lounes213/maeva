import type { Metadata } from "next";
import "./globals.css";
import 'animate.css';
import { Toaster } from "react-hot-toast";

import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from "./provider";

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: "MAEVA - Vêtements Traditionnels Algériens",
  description: "Découvrez notre collection exclusive de vêtements traditionnels algériens modernisés, fabriqués à la main par nos artisans locaux.",
};




export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body suppressHydrationWarning={true} className="font-sans">
        <Providers>
          <Toaster position="top-right" reverseOrder={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}