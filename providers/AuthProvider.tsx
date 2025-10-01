"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"
import { CartProvider } from "@/contexts/CartContext"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  )
}
