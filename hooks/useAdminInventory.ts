"use client"

import { useState, useEffect } from "react"

interface Product {
  id: string
  name: string
  description?: string
  price: string
  image?: string
  inStock: boolean
  stock: number
  createdAt: Date
  updatedAt: Date
  categoryId: string
  categoryName?: string
  status: string
}

interface UseAdminInventoryResult {
  products: Product[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  total: number
}

export function useAdminInventory(
  category?: string,
  search?: string
): UseAdminInventoryResult {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (category && category !== "all") params.append("category", category)
      if (search) params.append("search", search)

      const url = `/api/admin/inventory${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(url, {
        credentials: "same-origin"
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setProducts(data.products)
        setTotal(data.total || data.products.length)
      } else {
        throw new Error(data.error || "Failed to fetch inventory")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [category, search])

  return {
    products,
    isLoading,
    error,
    refetch: fetchInventory,
    total
  }
}
