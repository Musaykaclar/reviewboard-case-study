"use client"
import { signIn, useSession } from "next-auth/react"
import { Github, Mail, Star, ArrowRight, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import "./globals.css" 

export default function HomePage() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // ✅ Giriş yapıldıysa dashboard'a yönlendir
  useEffect(() => {
    if (session) {
      router.push("/dashboard")
    }
  }, [session, router])

  if (!mounted) return null

  return (
    <div className="login-container">
      {/* Çok renkli background efektleri */}
      <div className="login-background">
        {/* Ana renkli daireler */}
        <div className="login-circle-1"></div>
        <div className="login-circle-2"></div>
        <div className="login-circle-3"></div>
        <div className="login-circle-4"></div>
      </div>

      {/* Floating particles */}
      <div className="login-particles">
        <div className="login-particle-1"></div>
        <div className="login-particle-2"></div>
        <div className="login-particle-3"></div>
        <div className="login-particle-4"></div>
        <div className="login-particle-5"></div>
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center justify-center">
        {!session ? (
          <div className="login-card">
            {/* Logo ve Başlık */}
            <div className="text-center mb-8">
              <div className="login-logo">
                <Star 
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    color: 'white',
                    animation: 'spin 3s linear infinite'
                  }} 
                />
                <Sparkles 
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '20px',
                    height: '20px',
                    color: '#fcd34d',
                    animation: 'bounce 1s ease-in-out infinite'
                  }}
                />
              </div>
              <h1 className="login-title">
                ReviewBoard
              </h1>
              
            </div>

            {/* Login buttons - Çok renkli */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => signIn("github")}
                className="login-button-github"
              >
                <Github style={{ width: '20px', height: '20px' }} />
                <span>GitHub ile Giriş</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>

              <button
                onClick={() => signIn("email")}
                className="login-button-email"
              >
                <Mail style={{ width: '20px', height: '20px' }} />
                <span>Email ile Giriş</span>
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {/* Alt bilgi */}
            <div className="mt-6 text-center">
              
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="login-loading-card">
              <div className="login-loading-logo">
                <Star 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    color: 'white',
                    animation: 'spin 1s linear infinite'
                  }} 
                />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Yönlendiriliyor...
              </h2>
              <p className="text-gray-600">Dashboard&apos;a gidiyorsunuz</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
