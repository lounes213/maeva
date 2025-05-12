'use client';

import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden group',
  {
    variants: {
      variant: {
        primary: 'bg-amber-600 text-white hover:bg-amber-700 focus-visible:ring-amber-600',
        secondary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600',
        outline: 'border-2 border-amber-600 text-amber-600 hover:bg-amber-50 focus-visible:ring-amber-600',
        ghost: 'bg-transparent hover:bg-gray-100 text-gray-800 focus-visible:ring-gray-400',
        link: 'text-amber-600 underline-offset-4 hover:underline p-0 h-auto',
        destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
      },
      size: {
        xs: 'text-xs px-2.5 py-1.5 rounded-full',
        sm: 'text-sm px-3 py-2 rounded-full',
        md: 'text-sm px-4 py-2 rounded-full',
        lg: 'text-base px-6 py-3 rounded-full',
        xl: 'text-lg px-8 py-4 rounded-full',
        icon: 'p-2',
      },
      fullWidth: {
        true: 'w-full',
      },
      withRipple: {
        true: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      withRipple: true,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
}

const ModernButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      withRipple,
      isLoading,
      leftIcon,
      rightIcon,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (withRipple) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.style.transform = 'translate(-50%, -50%) scale(0)';
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.borderRadius = '50%';
        ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
        ripple.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        button.appendChild(ripple);

        setTimeout(() => {
          ripple.style.width = '300px';
          ripple.style.height = '300px';
          ripple.style.transform = 'translate(-50%, -50%) scale(1)';
          ripple.style.opacity = '0';
        }, 10);

        setTimeout(() => {
          ripple.remove();
        }, 600);
      }

      onClick?.(event);
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, withRipple }), className)}
        ref={ref}
        onClick={handleClick}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

ModernButton.displayName = 'ModernButton';

export { ModernButton, buttonVariants };