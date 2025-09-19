import { Item, Status } from "@prisma/client"
import { RISK_FILTER_OPTIONS } from "../constants"

export interface FilterOptions {
  searchTerm: string
  statusFilter: Status | ""
  riskFilter: string
  tagFilter: string
}

// Arama terimi ile eşleşme kontrolü
export const matchesSearch = (item: Item, searchTerm: string): boolean => {
  if (!searchTerm) return true
  
  const term = searchTerm.toLowerCase()
  const title = item.title.toLowerCase()
  const description = item.description?.toLowerCase() || ""
  const tags = item.tags || []
  
  return (
    title.includes(term) ||
    description.includes(term) ||
    tags.some(tag => tag.toLowerCase().includes(term))
  )
}

// Status ile eşleşme kontrolü
export const matchesStatus = (item: Item, statusFilter: Status | ""): boolean => {
  if (!statusFilter) return true
  return item.status === statusFilter
}

// Risk skoru ile eşleşme kontrolü
export const matchesRisk = (item: Item, riskFilter: string): boolean => {
  if (!riskFilter) return true
  
  const riskOption = RISK_FILTER_OPTIONS.find(option => option.value === riskFilter)
  if (!riskOption) return true
  
  return item.riskScore >= riskOption.min && item.riskScore <= riskOption.max
}

// Tag ile eşleşme kontrolü
export const matchesTag = (item: Item, tagFilter: string): boolean => {
  if (!tagFilter) return true
  
  const filter = tagFilter.toLowerCase()
  const tags = item.tags || []
  
  return tags.some(tag => tag.toLowerCase().includes(filter))
}

// Ana filtreleme fonksiyonu
export const filterItems = (items: Item[], filters: FilterOptions): Item[] => {
  return items.filter(item => {
    return (
      matchesSearch(item, filters.searchTerm) &&
      matchesStatus(item, filters.statusFilter) &&
      matchesRisk(item, filters.riskFilter) &&
      matchesTag(item, filters.tagFilter)
    )
  })
}

// Filtreleri temizle
export const clearFilters = (): FilterOptions => ({
  searchTerm: "",
  statusFilter: "",
  riskFilter: "",
  tagFilter: "",
})
