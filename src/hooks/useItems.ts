import { useState, useEffect } from "react"
import { Item } from "@prisma/client"
import { API_ENDPOINTS, VALIDATION_MESSAGES } from "../constants"
import { validateItemForm } from "../utils/validation"
import { prepareItemForAPI } from "../utils/formatters"

export interface UseItemsReturn {
  items: Item[]
  loading: boolean
  error: string | null
  fetchItems: () => Promise<void>
  addItem: (formData: {
    title: string
    description: string
    amount: string | number
    tagsInput: string
  }) => Promise<boolean>
  clearError: () => void
}

export const useItems = (): UseItemsReturn => {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchItems = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(API_ENDPOINTS.ITEMS)
      const data = await res.json()
      
      if (Array.isArray(data)) {
        setItems(data)
      } else if (data.error) {
        setError(data.error)
        setItems([])
      } else {
        setItems([])
      }
    } catch (error) {
      console.error('Fetch items error:', error)
      setError(VALIDATION_MESSAGES.GENERIC_ERROR)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (formData: {
    title: string
    description: string
    amount: string | number
    tagsInput: string
  }): Promise<boolean> => {
    // Validasyon
    const validation = validateItemForm(formData)
    if (!validation.isValid) {
      setError(validation.message || VALIDATION_MESSAGES.REQUIRED_FIELDS)
      return false
    }

    setLoading(true)
    setError(null)
    
    try {
      const itemData = prepareItemForAPI(formData)
      
      const res = await fetch(API_ENDPOINTS.ITEMS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemData),
      })
      
      if (res.ok) {
        const newItem = await res.json()
        setItems(prev => [newItem, ...prev])
        return true
      } else {
        const errorData = await res.json()
        setError(errorData.error || VALIDATION_MESSAGES.ITEM_CREATE_ERROR)
        return false
      }
    } catch (error) {
      console.error('Add item error:', error)
      setError(VALIDATION_MESSAGES.GENERIC_ERROR)
      return false
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    fetchItems()
  }, [])

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    clearError,
  }
}
