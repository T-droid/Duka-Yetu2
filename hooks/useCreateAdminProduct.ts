"use client"

import { useState } from "react"

interface CreateProductData {
  name: string
  description?: string
  price: number | string
  category?: string
  categoryId?: string
  image?: string[]
  specifications?: Record<string, string>
  stock?: number
}

interface UseCreateAdminProductResult {
  createProduct: (data: CreateProductData) => Promise<any>
  isCreating: boolean
  error: string | null
  success: boolean
}

export function useCreateAdminProduct(): UseCreateAdminProductResult {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const createProduct = async (data: CreateProductData) => {
    try {
      setIsCreating(true)
      setError(null)
      setSuccess(false)

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`)
      }

      if (result.success) {
        setSuccess(true)
        return result.product
      } else {
        throw new Error(result.error || "Failed to create product")
      }
    } catch (err) {
      console.error("Full error creating product:", err)
      console.error("Response details:", {
        status: err instanceof Response ? err.status : 'Unknown',
        statusText: err instanceof Response ? err.statusText : 'Unknown'
      })
      const errorMessage = err instanceof Error ? err.message : "Failed to create product"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  return {
    createProduct,
    isCreating,
    error,
    success
  }
}
