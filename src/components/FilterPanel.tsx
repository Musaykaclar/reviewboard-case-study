"use client"

import { Search, Filter, X } from "lucide-react"
import { Status } from "@prisma/client"
import { CSS_CLASSES, STATUS_OPTIONS, RISK_FILTER_OPTIONS } from "../constants"
import { FilterOptions, clearFilters } from "../utils/filters"

export interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange(clearFilters())
  }

  return (
    <div className={CSS_CLASSES.DASHBOARD_FORM_CARD}>
      <h2 className={`${CSS_CLASSES.DASHBOARD_FORM_TITLE} flex items-center gap-2`}>
        <Filter style={{ width: '24px', height: '24px' }} />
        Filtreler
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ara</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Başlık, açıklama, tag..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full pl-10`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
          <select
            value={filters.statusFilter}
            onChange={(e) => updateFilter('statusFilter', e.target.value as Status | '')}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
          >
            <option value="">Tümü</option>
            {STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Risk</label>
          <select
            value={filters.riskFilter}
            onChange={(e) => updateFilter('riskFilter', e.target.value)}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
          >
            <option value="">Tümü</option>
            {RISK_FILTER_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
          <input
            type="text"
            placeholder="tag ara"
            value={filters.tagFilter}
            onChange={(e) => updateFilter('tagFilter', e.target.value)}
            className={`${CSS_CLASSES.DASHBOARD_INPUT} w-full`}
          />
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={clearAllFilters}
          className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <X style={{ width: '16px', height: '16px' }} />
          Temizle
        </button>
      </div>
    </div>
  )
}
