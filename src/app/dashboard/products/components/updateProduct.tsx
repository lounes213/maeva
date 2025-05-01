import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'px-4 py-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary:
      'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface UpdateProductProps {
  product: any; // Replace 'any' with the appropriate type for 'product'
  refreshProducts: () => void;
}

const UpdateProduct: React.FC<UpdateProductProps> = ({ product, refreshProducts }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (updatedProduct: any) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products?id=${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur de sauvegarde:', errorData);
        throw new Error(errorData.message || 'Échec de la sauvegarde du produit');
      }

      toast.success('Produit mis à jour avec succès');
      refreshProducts();
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);

      if (error instanceof Error) {
        toast.error(error.message || 'Une erreur est survenue lors de la mise à jour du produit');
      } else {
        toast.error('Une erreur inconnue est survenue lors de la mise à jour du produit');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Formulaire de mise à jour du produit */}
      <button
        onClick={() => handleSave(product)}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isLoading ? 'Enregistrement...' : 'Enregistrer'}
      </button>
    </div>
  );
};

export default UpdateProduct;