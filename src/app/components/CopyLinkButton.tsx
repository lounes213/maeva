'use client';

import { FaLink } from 'react-icons/fa';
import { useState } from 'react';

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="text-gray-500 hover:text-gray-700 transition-colors relative"
    >
      <FaLink size={18} />
      {copied && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
}
