import { useState, useEffect } from "react"
import React from "react"
import { API_ENDPOINTS, VALIDATION_MESSAGES, DEFAULT_FORM_VALUES } from "../constants"
import { validateRuleForm, validateRuleBuilder } from "../utils/validation"

export interface Rule {
  id: string
  name: string
  description?: string | null
  condition: string
  score: number
  isActive: boolean
  priority: number
  createdAt: string
}

export interface RuleBuilder {
  field: string
  operator: string
  value: string | number
}

export interface UseRulesReturn {
  rules: Rule[]
  loading: boolean
  submitting: boolean
  error: string | null
  form: typeof DEFAULT_FORM_VALUES.RULE
  builder: RuleBuilder
  fetchRules: () => Promise<void>
  createRule: () => Promise<boolean>
  toggleActive: (rule: Rule) => Promise<void>
  updatePriority: (rule: Rule, delta: number) => Promise<void>
  removeRule: (rule: Rule) => Promise<boolean>
  setForm: React.Dispatch<React.SetStateAction<typeof DEFAULT_FORM_VALUES.RULE>>
  setBuilder: React.Dispatch<React.SetStateAction<RuleBuilder>>
  clearForm: () => void
  clearError: () => void
}

export const useRules = (): UseRulesReturn => {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(DEFAULT_FORM_VALUES.RULE)
  const [builder, setBuilder] = useState<RuleBuilder>({
    field: 'amount',
    operator: '>',
    value: 5000,
  })

  const fetchRules = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(API_ENDPOINTS.RULES)
      const data = await res.json()
      setRules(data.rules || [])
    } catch (error) {
      console.error('Fetch rules error:', error)
      setError(VALIDATION_MESSAGES.GENERIC_ERROR)
    } finally {
      setLoading(false)
    }
  }

  const createRule = async (): Promise<boolean> => {
    // Validasyon
    const ruleValidation = validateRuleForm(form)
    if (!ruleValidation.isValid) {
      setError(ruleValidation.message || 'Geçerli bir kural oluşturun')
      return false
    }

    const builderValidation = validateRuleBuilder(builder)
    if (!builderValidation.isValid) {
      setError(builderValidation.message || 'Geçerli bir kural koşulu seçin')
      return false
    }

    setSubmitting(true)
    setError(null)
    
    try {
      const condition = JSON.stringify({
        field: builder.field,
        operator: builder.operator,
        value: builder.value
      })

      const res = await fetch(API_ENDPOINTS.RULES, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          score: form.score,
          priority: form.priority,
          isActive: form.isActive,
          condition,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setRules(prev => [created, ...prev])
        clearForm()
        return true
      } else {
        const errorData = await res.json().catch(() => ({}))
        setError(errorData.error || VALIDATION_MESSAGES.RULE_CREATE_ERROR)
        return false
      }
    } catch (error) {
      console.error('Create rule error:', error)
      setError(VALIDATION_MESSAGES.GENERIC_ERROR)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (rule: Rule) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.RULES}/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !rule.isActive }),
      })
      
      if (res.ok) {
        const updated = await res.json()
        setRules(prev => prev.map(r => r.id === rule.id ? updated : r))
      }
    } catch (error) {
      console.error('Toggle active error:', error)
      setError(VALIDATION_MESSAGES.GENERIC_ERROR)
    }
  }

  const updatePriority = async (rule: Rule, delta: number) => {
    try {
      const res = await fetch(`${API_ENDPOINTS.RULES}/${rule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: rule.priority + delta }),
      })
      
      if (res.ok) {
        const updated = await res.json()
        setRules(prev => 
          prev.map(r => r.id === rule.id ? updated : r)
            .sort((a, b) => b.priority - a.priority)
        )
      }
    } catch (error) {
      console.error('Update priority error:', error)
      setError(VALIDATION_MESSAGES.GENERIC_ERROR)
    }
  }

  const removeRule = async (rule: Rule): Promise<boolean> => {
    if (!confirm(VALIDATION_MESSAGES.DELETE_CONFIRM)) return false
    
    try {
      const res = await fetch(`${API_ENDPOINTS.RULES}/${rule.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        setRules(prev => prev.filter(r => r.id !== rule.id))
        return true
      } else {
        setError(VALIDATION_MESSAGES.GENERIC_ERROR)
        return false
      }
    } catch (error) {
      console.error('Remove rule error:', error)
      setError(VALIDATION_MESSAGES.GENERIC_ERROR)
      return false
    }
  }

  const clearForm = () => {
    setForm(DEFAULT_FORM_VALUES.RULE)
    setBuilder({
      field: 'amount',
      operator: '>',
      value: 5000,
    })
  }

  const clearError = () => {
    setError(null)
  }

  useEffect(() => {
    fetchRules()
  }, [])

  return {
    rules,
    loading,
    submitting,
    error,
    form,
    builder,
    fetchRules,
    createRule,
    toggleActive,
    updatePriority,
    removeRule,
    setForm,
    setBuilder,
    clearForm,
    clearError,
  }
}
