"use client"

import { useState, useCallback } from "react"

interface UseCheckProductExistsResult {
  checkProductExists: (name: string, categoryId?: string, categoryName?: string) => Promise<boolean>
  isChecking: boolean
  error: string | null
}

export function useCheckProductExists(): UseCheckProductExistsResult {
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkProductExists = useCallback(async (
    name: string,
    categoryId?: string,
    categoryName?: string
  ): Promise<boolean> => {
    if (!name.trim()) return false
    if (!categoryId && !categoryName) return false

    try {
      setIsChecking(true)
      setError(null)

      const params = new URLSearchParams()
      params.append("name", name.trim())
      if (categoryId) params.append("categoryId", categoryId)
      if (categoryName) params.append("categoryName", categoryName)

      const response = await fetch(`/api/admin/check-product?${params.toString()}`, {
        credentials: "same-origin"
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        return data.exists
      } else {
        throw new Error(data.error || "Failed to check product existence")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check product")
      return false
    } finally {
      setIsChecking(false)
    }
  }, [])

  return {
    checkProductExists,
    isChecking,
    error
  }
}
