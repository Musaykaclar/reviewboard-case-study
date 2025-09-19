import { useState } from "react"
import { Status } from "@prisma/client"
import { FilterOptions, clearFilters } from "../utils/filters"

export interface UseFiltersReturn {
  filters: FilterOptions
  setSearchTerm: (term: string) => void
  setStatusFilter: (status: Status | "") => void
  setRiskFilter: (risk: string) => void
  setTagFilter: (tag: string) => void
  clearAllFilters: () => void
  updateFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void
}

export const useFilters = (): UseFiltersReturn => {
  const [filters, setFilters] = useState<FilterOptions>(clearFilters())

  const setSearchTerm = (term: string) => {
    setFilters(prev => ({ ...prev, searchTerm: term }))
  }

  const setStatusFilter = (status: Status | "") => {
    setFilters(prev => ({ ...prev, statusFilter: status }))
  }

  const setRiskFilter = (risk: string) => {
    setFilters(prev => ({ ...prev, riskFilter: risk }))
  }

  const setTagFilter = (tag: string) => {
    setFilters(prev => ({ ...prev, tagFilter: tag }))
  }

  const clearAllFilters = () => {
    setFilters(clearFilters())
  }

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return {
    filters,
    setSearchTerm,
    setStatusFilter,
    setRiskFilter,
    setTagFilter,
    clearAllFilters,
    updateFilter,
  }
}
