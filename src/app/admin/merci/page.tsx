import Image from 'next/image';

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <Image src="/logo.png" alt="Logo" width={100} height={100} className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-amber-600 mb-4">Merci pour votre visite !</h1>
        <p className="text-gray-700 mb-6">Nous espérons vous revoir très bientôt dans notre boutique. À très bientôt !</p>
        <a
          href="/"
          className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-amber-700 transition"
        >
          Retour à la boutique
        </a>
      </div>
    </div>
  );
}