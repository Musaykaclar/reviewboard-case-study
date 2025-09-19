"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Package } from "lucide-react"
import { Status } from "@prisma/client"
import { CSS_CLASSES } from "../../../constants"
import { useItems } from "../../../hooks/useItems"
import { filterItems, FilterOptions } from "../../../utils/filters"
import ItemForm from "../../../components/ItemForm"
import FilterPanel from "../../../components/FilterPanel"
import ItemList from "../../../components/ItemList"
import NoSessionMessage from "../../../components/NoSessionMessage"
import "../../../app/globals.css"

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, loading, fetchItems } = useItems()
  
  // Filtre state'ini burada yönet
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    statusFilter: "",
    riskFilter: "",
    tagFilter: "",
  })

  // Filtrelenmiş itemları hesapla
  const filteredItems = filterItems(items, filters)

  if (!session) {
    return (
      <NoSessionMessage
        icon={<Package style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />}
        message="Giriş yapmanız gerekiyor"
      />
    )
  }

  const handleItemClick = (item: any) => {
    router.push(`/dashboard/items/${item.id}`)
  }

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters)
  }

  const handleItemAdded = () => {
    // Item eklendikten sonra listeyi yenile
    fetchItems()
  }

  return (
    <div className={CSS_CLASSES.DASHBOARD_CONTAINER}>
      {/* Renkli background efektleri */}
      <div className="dashboard-background">
        <div className="dashboard-circle-1"></div>
        <div className="dashboard-circle-2"></div>
        <div className="dashboard-circle-3"></div>
      </div>

      {/* Header */}
      <div className={`${CSS_CLASSES.DASHBOARD_FORM_CARD} mb-6`}>
        <div className="flex items-center justify-between">
          <h1 className={CSS_CLASSES.DASHBOARD_FORM_TITLE}>Items</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      <ItemForm onItemAdded={handleItemAdded} />

      {/* Filters */}
      <FilterPanel 
        filters={filters}
        onFiltersChange={handleFilterChange}
      />

      {/* Filtered Item List */}
      <ItemList 
        items={filteredItems} 
        onItemClick={handleItemClick}
      />
    </div>
  )
}
