"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Package, DollarSign, Tag, AlertTriangle, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react"

// Item tipi Prisma'dan gelen Item tipinden biraz daha JS-friendly olarak
type ItemType = {
  id: string
  title: string
  description?: string | null
  amount: number
  tags: string[]
  riskScore: number
  status: "NEW" | "IN_REVIEW" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt: string
}

export default function ItemDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const itemId = params.id as string

  const [item, setItem] = useState<ItemType | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [scoreLoading, setScoreLoading] = useState(false)

  // fetchItem fonksiyonunu useCallback ile sarmalayarak useEffect bağımlılığı sorununu çözüyoruz
  const fetchItem = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/items/${itemId}`)
      if (!res.ok) throw new Error("Item not found")
      const data: ItemType = await res.json()
      setItem(data)
    } catch (error) {
      console.error("Error fetching item:", error)
      setItem(null)
    } finally {
      setLoading(false)
    }
  }, [itemId])

  useEffect(() => {
    if (itemId) fetchItem()
  }, [itemId, fetchItem])

  const handleStatusChange = async (newStatus: ItemType["status"]) => {
    if (!item) return
    setStatusLoading(true)
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updatedItem: ItemType = await res.json()
        setItem(updatedItem)
      }
    } catch (error) {
      console.error("Error updating status:", error)
    } finally {
      setStatusLoading(false)
    }
  }

  const calculateRiskScore = async () => {
    if (!item) return
    setScoreLoading(true)
    try {
      const res = await fetch(`/api/score/${itemId}`, { method: "POST" })
      if (res.ok) {
        const data: { riskScore: number } = await res.json()
        setItem({ ...item, riskScore: data.riskScore })
      }
    } catch (error) {
      console.error("Error calculating risk score:", error)
    } finally {
      setScoreLoading(false)
    }
  }

  // risk ve status helper fonksiyonları (aynı şekilde bırakıldı)
  const getRiskColor = (score: number) => score >= 80 ? "text-red-500" : score >= 50 ? "text-yellow-500" : score >= 20 ? "text-blue-500" : "text-green-500"
  const getRiskLevel = (score: number) => score >= 80 ? "Yüksek Risk" : score >= 50 ? "Orta Risk" : score >= 20 ? "Düşük Risk" : "Çok Düşük Risk"
  const getStatusColor = (status: ItemType["status"]) => {
    switch (status) {
      case "NEW": return "bg-blue-100 text-blue-800"
      case "IN_REVIEW": return "bg-yellow-100 text-yellow-800"
      case "APPROVED": return "bg-green-100 text-green-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }
  const getStatusIcon = (status: ItemType["status"]) => {
    switch (status) {
      case "NEW": return <Package className="w-4 h-4" />
      case "IN_REVIEW": return <Clock className="w-4 h-4" />
      case "APPROVED": return <CheckCircle className="w-4 h-4" />
      case "REJECTED": return <XCircle className="w-4 h-4" />
      default: return <Package className="w-4 h-4" />
    }
  }

  if (!session) return (
    <div className="dashboard-no-session text-center">
      <Package className="w-16 h-16 mx-auto mb-2" />
      <p>Giriş yapmanız gerekiyor</p>
    </div>
  )

  if (loading) return (
    <div className="dashboard-container flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
    </div>
  )

  if (!item) return (
    <div className="dashboard-container flex flex-col items-center justify-center min-h-screen text-white">
      <Package className="w-16 h-16 mb-2" />
      <h2 className="text-2xl font-bold mb-2">Item Bulunamadı</h2>
      <p className="text-gray-300 mb-4">Aradığınız item mevcut değil.</p>
      <button onClick={() => router.push('/dashboard/items')} className="dashboard-add-btn flex items-center gap-2">
        <ArrowLeft className="w-5 h-5" />
        Geri Dön
      </button>
    </div>
  )

  return (
    <div className="dashboard-container">
      {/* ... geri kalan JSX aynı şekilde */}
    </div>
  )
}
