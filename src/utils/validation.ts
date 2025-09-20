// Form validation fonksiyonları

export interface ValidationResult {
  isValid: boolean
  message?: string
}

// Item form validasyonu
export const validateItemForm = (formData: {
  title: string
  amount: string | number
}): ValidationResult => {
  if (!formData.title || !formData.title.trim()) {
    return {
      isValid: false,
      message: 'Başlık gerekli'
    }
  }

  if (!formData.amount || formData.amount === '') {
    return {
      isValid: false,
      message: 'Tutar gerekli'
    }
  }

  const amount = typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount
  if (isNaN(amount) || amount < 0) {
    return {
      isValid: false,
      message: 'Geçerli bir tutar girin'
    }
  }

  return { isValid: true }
}

// Rule form validasyonu
export const validateRuleForm = (formData: {
  name: string
  score: number
  condition: string
}): ValidationResult => {
  if (!formData.name || !formData.name.trim()) {
    return {
      isValid: false,
      message: 'Kural adı gerekli'
    }
  }

  if (typeof formData.score !== 'number' || formData.score < 0 || formData.score > 100) {
    return {
      isValid: false,
      message: 'Skor 0-100 arasında olmalı'
    }
  }

  if (!formData.condition || typeof formData.condition !== 'object') {
    return {
      isValid: false,
      message: 'Geçerli bir kural koşulu seçin'
    }
  }

  return { isValid: true }
}

// Rule builder validasyonu
export const validateRuleBuilder = (builder: {
  field: string
  operator: string
  value: string | number
}): ValidationResult => {
  const { field, value } = builder

  if (field === 'amount') {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        isValid: false,
        message: 'Amount için sayısal değer gerekli'
      }
    }
  }

  if (field === 'status') {
    const validStatuses = ['NEW', 'IN_REVIEW', 'APPROVED', 'REJECTED']
    if (!validStatuses.includes(String(value))) {
      return {
        isValid: false,
        message: 'Geçerli bir status seçin'
      }
    }
  }

  if (['tags', 'description', 'title'].includes(field)) {
    if (!String(value || '').trim()) {
      return {
        isValid: false,
        message: 'Bu alan için değer gerekli'
      }
    }
  }

  return { isValid: true }
}
