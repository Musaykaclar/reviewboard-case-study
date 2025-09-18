"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Package, 
  Shield, 
  Settings, 
  LogOut, 
  Home, 
  Star,
  CheckCircle,
  BarChart3,
  Users
} from "lucide-react"

export default function DashboardPage() {
  const { data: session, status } = useSession({ required: true })
  const pathname = usePathname()

  if (status === "loading") {
    return (
      <div className="dashboard-no-session">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  const getUserInitial = (name?: string | null, email?: string | null) => {
    if (name) return name.charAt(0).toUpperCase()
    if (email) return email.charAt(0).toUpperCase()
    return 'U'
  }

  return (
    <div className="dashboard-main-container">
      {/* Renkli background efektleri */}
      <div className="dashboard-main-background">
        <div className="dashboard-main-circle-1"></div>
        <div className="dashboard-main-circle-2"></div>
        <div className="dashboard-main-circle-3"></div>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          {/* Sidebar Header */}
          <div className="dashboard-sidebar-header">
            <h1 className="dashboard-sidebar-title">ReviewBoard</h1>
            <p className="dashboard-sidebar-subtitle">Yönetim Paneli</p>
          </div>

          {/* User Info */}
          <div className="dashboard-sidebar-user">
            <div className="dashboard-user-avatar">
              {getUserInitial(session?.user?.name, session?.user?.email)}
            </div>
            <div className="dashboard-user-info">
              <div className="dashboard-user-name">
                {session?.user?.name || "Kullanıcı"}
              </div>
              <div className="dashboard-user-email">
                {session?.user?.email}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="dashboard-nav">
            <Link 
              href="/dashboard" 
              className={`dashboard-nav-item ${pathname === '/dashboard' ? 'active' : ''}`}
            >
              <Home className="dashboard-nav-icon" />
              Ana Sayfa
            </Link>
            <Link 
              href="/dashboard/items" 
              className={`dashboard-nav-item ${pathname === '/dashboard/items' ? 'active' : ''}`}
            >
              <Package className="dashboard-nav-icon" />
              Items
            </Link>
            <Link 
              href="/dashboard/audits" 
              className={`dashboard-nav-item ${pathname === '/dashboard/audits' ? 'active' : ''}`}
            >
              <BarChart3 className="dashboard-nav-icon" />
              Audits
            </Link>
            <Link 
              href="/dashboard/rules" 
              className={`dashboard-nav-item ${pathname === '/dashboard/rules' ? 'active' : ''}`}
            >
              <Settings className="dashboard-nav-icon" />
              Rules
            </Link>
          </nav>

          {/* Logout Button */}
          <div className="dashboard-logout-sidebar">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="dashboard-logout-btn-sidebar"
            >
              <LogOut style={{ width: '18px', height: '18px' }} />
              Çıkış Yap
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content">
          {/* Content Header */}
          <div className="dashboard-content-header">
            <h1 className="dashboard-content-title">
              Hoş Geldin, {session?.user?.name || "Kullanıcı"}! 👋
            </h1>
            <p className="dashboard-content-subtitle">
              ReviewBoard yönetim paneline hoş geldin. Buradan tüm işlemlerini yönetebilir, 
              item'larını takip edebilir ve sistem ayarlarını düzenleyebilirsin.
            </p>
          </div>

          {/* Welcome Card */}
          <div className="dashboard-welcome-card">
            <h2 className="dashboard-welcome-title">
              <Star style={{ width: '24px', height: '24px' }} />
              Dashboard'a Genel Bakış
            </h2>
            <p className="dashboard-welcome-text">
              Sol menüden istediğin bölüme geçebilirsin. Her bölüm farklı işlevler sunuyor:
            </p>
            
            <div className="dashboard-features">
              <div className="dashboard-feature">
                <Package className="dashboard-feature-icon" />
                <span className="dashboard-feature-text">Items Yönetimi</span>
              </div>
              <div className="dashboard-feature">
                <BarChart3 className="dashboard-feature-icon" />
                <span className="dashboard-feature-text">Audit Raporları</span>
              </div>
              <div className="dashboard-feature">
                <Settings className="dashboard-feature-icon" />
                <span className="dashboard-feature-text">Kurallar & Ayarlar</span>
              </div>
              <div className="dashboard-feature">
                <CheckCircle className="dashboard-feature-icon" />
                <span className="dashboard-feature-text">Onay Süreçleri</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
