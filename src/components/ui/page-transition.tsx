'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const pathname = usePathname();
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    // After first mount, set isFirstMount to false
    setIsFirstMount(false);
  }, []);

  // Variants for page transitions
  const variants = {
    hidden: { opacity: 0, y: 20 },
    enter: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4, 
        ease: [0.33, 1, 0.68, 1],
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      transition: { 
        duration: 0.2,
        ease: [0.33, 1, 0.68, 1]
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        initial={isFirstMount ? false : 'hidden'}
        animate="enter"
        exit="exit"
        variants={variants}
        className={className}
      >
        {/* Page loading indicator */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-50"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.4 }}
        />
        
        {children}
      </motion.main>
    </AnimatePresence>
  );
}