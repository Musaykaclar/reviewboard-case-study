"use client"

import { Package, DollarSign } from "lucide-react"
import { Item } from "@prisma/client"
import { CSS_CLASSES } from "../constants"
import { 
  formatCurrency, 
  getStatusLabel, 
  getStatusColor, 
  getRiskScoreColor 
} from "../utils/formatters"

export interface ItemCardProps {
  item: Item
  onClick?: () => void
}

export default function ItemCard({ item, onClick }: ItemCardProps) {
  return (
    <div 
      className={`${CSS_CLASSES.DASHBOARD_ITEM_CARD} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <h3 className={`${CSS_CLASSES.DASHBOARD_ITEM_TITLE} flex items-center gap-2`}>
        <Package style={{ width: '20px', height: '20px' }} />
        {item.title}
      </h3>

      {item.description && (
        <p className={CSS_CLASSES.DASHBOARD_ITEM_DESCRIPTION}>
          {item.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <p className={`${CSS_CLASSES.DASHBOARD_ITEM_AMOUNT} flex items-center gap-1`}>
          <DollarSign style={{ width: '16px', height: '16px' }} />
          {formatCurrency(item.amount)}
        </p>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
            {getStatusLabel(item.status)}
          </span>

          {item.riskScore > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskScoreColor(item.riskScore)}`}>
              Risk: {item.riskScore}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
