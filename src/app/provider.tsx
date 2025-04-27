'use client';

import { CartProvider } from "./context/cartContext";

export function Providers({ children }:any) {
  return <CartProvider>{children}</CartProvider>;
}