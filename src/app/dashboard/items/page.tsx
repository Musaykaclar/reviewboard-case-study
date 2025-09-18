"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Item, Status } from "@prisma/client"
import { Plus, LogOut, Package, DollarSign, Filter, Search, X } from "lucide-react"
import "../../../app/globals.css"

export default function DashboardPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [loading, setLoading] = useState(false)
  
  // Filtreleme state'leri
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<Status | "">("")
  const [riskFilter, setRiskFilter] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [tagsInput, setTagsInput] = useState("")

  // Kullanıcının itemlarını çek
  const fetchItems = async () => {
    try {
      const res = await fetch("/api/items")
      const data = await res.json()
      
      // Eğer data array değilse veya error varsa
      if (Array.isArray(data)) {
        setItems(data)
      } else if (data.error) {
        console.error('API Error:', data.error)
        setItems([]) // Boş array olarak ayarla
      } else {
        setItems([]) // Güvenlik için boş array
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setItems([]) // Hata durumunda boş array
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleAddItem = async () => {
    if (!title || amount === "") return alert("Title ve Amount gerekli")
    setLoading(true)
    
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          amount, 
          tags: tagsInput
            .split(',')
            .map(t => t.trim())
            .filter(Boolean)
        }),
      })
      
      if (res.ok) {
        const newItem = await res.json()
        setItems([newItem, ...items])
        setTitle("")
        setDescription("")
        setAmount("")
        setTagsInput("")
      } else {
        const errorData = await res.json()
        alert(`Hata: ${errorData.error || 'Item eklenemedi'}`)
      }
    } catch (error) {
      console.error('Add item error:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="dashboard-no-session">
        <div className="text-center">
          <Package style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }} />
          <p>Giriş yapmanız gerekiyor</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Renkli background efektleri */}
      <div className="dashboard-background">
        <div className="dashboard-circle-1"></div>
        <div className="dashboard-circle-2"></div>
        <div className="dashboard-circle-3"></div>
      </div>

      {/* Header */}
      <div className="dashboard-form-card mb-6">
        <div className="flex items-center justify-between">
          <h1 className="dashboard-form-title">Items</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Dashboard'a Dön
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      <div className="dashboard-form-card">
        <h2 className="dashboard-form-title flex items-center gap-2">
          <Plus style={{ width: '24px', height: '24px' }} />
          Yeni Item Ekle
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              placeholder="Item başlığı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="dashboard-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <input
              type="text"
              placeholder="Item açıklaması"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="dashboard-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tutar *
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="dashboard-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiketler (virgülle)
            </label>
            <input
              type="text"
              placeholder="ör. finans, acil, capex"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="dashboard-input w-full"
            />
          </div>
        </div>
        <button
          onClick={handleAddItem}
          disabled={loading}
          className="dashboard-add-btn flex items-center gap-2"
        >
          <Plus style={{ width: '20px', height: '20px' }} />
          {loading ? "Ekleniyor..." : "Item Ekle"}
        </button>
      </div>

      {/* Filters */}
      <div className="dashboard-form-card">
        <h2 className="dashboard-form-title flex items-center gap-2">
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dashboard-input w-full pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | '')}
              className="dashboard-input w-full"
            >
              <option value="">Tümü</option>
              <option value="NEW">Yeni</option>
              <option value="IN_REVIEW">İnceleniyor</option>
              <option value="APPROVED">Onaylandı</option>
              <option value="REJECTED">Reddedildi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk</label>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="dashboard-input w-full"
            >
              <option value="">Tümü</option>
              <option value="HIGH">Yüksek (≥ 80)</option>
              <option value="MEDIUM">Orta (50-79)</option>
              <option value="LOW">Düşük (20-49)</option>
              <option value="VERY_LOW">Çok Düşük (&lt; 20)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
            <input
              type="text"
              placeholder="tag ara"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="dashboard-input w-full"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setRiskFilter(''); setTagFilter(''); }}
            className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Filtered Item List */}
      {(() => {
        const filtered = items.filter((it) => {
          const matchesSearch = !searchTerm ||
            it.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (it.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
            (it.tags || []).some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))

          const matchesStatus = !statusFilter || it.status === statusFilter

          let matchesRisk = true
          if (riskFilter === 'HIGH') matchesRisk = it.riskScore >= 80
          else if (riskFilter === 'MEDIUM') matchesRisk = it.riskScore >= 50 && it.riskScore < 80
          else if (riskFilter === 'LOW') matchesRisk = it.riskScore >= 20 && it.riskScore < 50
          else if (riskFilter === 'VERY_LOW') matchesRisk = it.riskScore < 20

          const matchesTag = !tagFilter || (it.tags || []).some(t => t.toLowerCase().includes(tagFilter.toLowerCase()))

          return matchesSearch && matchesStatus && matchesRisk && matchesTag
        })

        return (
      <div className="dashboard-items-grid">
            {(!Array.isArray(filtered) || filtered.length === 0) ? (
          <div className="col-span-full text-center py-12">
            <Package style={{ width: '64px', height: '64px', margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Filtreye uygun item yok</h3>
                <p className="text-gray-500">Filtreleri değiştirerek tekrar deneyin.</p>
          </div>
        ) : (
              filtered.map((item) => (
            <div 
              key={item.id} 
              className="dashboard-item-card cursor-pointer"
              onClick={() => router.push(`/dashboard/items/${item.id}`)}
            >
              <h3 className="dashboard-item-title flex items-center gap-2">
                <Package style={{ width: '20px', height: '20px' }} />
                {item.title}
              </h3>
              {item.description && (
                <p className="dashboard-item-description">{item.description}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="dashboard-item-amount flex items-center gap-1">
                  <DollarSign style={{ width: '16px', height: '16px' }} />
                  {item.amount.toLocaleString('tr-TR', { 
                    style: 'currency', 
                    currency: 'TRY' 
                  })}
                </p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                    item.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    item.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status === 'NEW' ? 'Yeni' :
                     item.status === 'IN_REVIEW' ? 'İnceleniyor' :
                     item.status === 'APPROVED' ? 'Onaylandı' :
                     'Reddedildi'}
                  </span>
                  {item.riskScore > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.riskScore >= 80 ? 'bg-red-100 text-red-800' :
                      item.riskScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      item.riskScore >= 20 ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      Risk: {item.riskScore}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
        )
      })()}
    </div>
  )
}
