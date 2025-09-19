"use client"

import { useState } from "react"
import { Plus, Save } from "lucide-react"
import { CSS_CLASSES, DEFAULT_FORM_VALUES } from "../constants"
import { useItems } from "../hooks/useItems"

export interface ItemFormProps {
  onItemAdded?: () => void
}

export default function ItemForm({ onItemAdded }: ItemFormProps) {
  const [formData, setFormData] = useState(DEFAULT_FORM_VALUES.ITEM)
  const { addItem, loading, error, clearError } = useItems()

  const handleSubmit = async () => {
    const success = await addItem({
      title: formData.title,
      description: formData.description,
      amount: formData.amount,
      tagsInput: formData.tags
    })
    
    if (success) {
      setFormData(DEFAULT_FORM_VALUES.ITEM)
      onItemAdded?.()
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) clearError()
  }

  return (
    <div className={CSS_CLASSES.DASHBOARD_FORM_CARD}>
      <h2 className={`${CSS_CLASSES.DASHBOARD_FORM_TITLE} flex items-center gap-2`}>
        <Plus style={{ width: '24px', height: '24px' }} />
        Yeni Item Ekle
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Başlık *
          </label>
          <input
            type="text"
            placeholder="Item başlığı"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Açıklama
          </label>
          <input
            type="text"
            placeholder="Item açıklaması"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tutar *
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || '')}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiketler (virgülle)
          </label>
          <input
            type="text"
            placeholder="ör. finans, acil, capex"
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`${CSS_CLASSES.DASHBOARD_ADD_BTN} flex items-center gap-2 mt-4`}
      >
        <Save style={{ width: '20px', height: '20px' }} />
        {loading ? "Ekleniyor..." : "Item Ekle"}
      </button>
    </div>
  )
}
