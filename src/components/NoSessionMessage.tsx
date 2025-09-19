"use client"

import { ReactNode } from "react"
import { CSS_CLASSES } from "../constants"

export interface NoSessionMessageProps {
  icon: ReactNode
  message: string
}

export default function NoSessionMessage({ icon, message }: NoSessionMessageProps) {
  return (
    <div className={CSS_CLASSES.DASHBOARD_NO_SESSION}>
      <div className="text-center">
        {icon}
        <p>{message}</p>
      </div>
    </div>
  )
}
