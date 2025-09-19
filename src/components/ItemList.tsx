"use client"

import { Package } from "lucide-react"
import { Item } from "@prisma/client"
import { CSS_CLASSES } from "../constants"
import ItemCard from "./ItemCard"

export interface ItemListProps {
  items: Item[]
  onItemClick?: (item: Item) => void
}

export default function ItemList({ items, onItemClick }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Package 
          style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 1rem', 
            opacity: 0.5 
          }} 
        />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          Filtreye uygun item yok
        </h3>
        <p className="text-gray-500">
          Filtreleri değiştirerek tekrar deneyin.
        </p>
      </div>
    )
  }

  return (
    <div className={CSS_CLASSES.DASHBOARD_ITEMS_GRID}>
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onClick={() => onItemClick?.(item)}
        />
      ))}
    </div>
  )
}
