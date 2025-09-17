"use client"
import { signIn, signOut, useSession } from "next-auth/react"
import { Github, Mail, LogOut, User, Star, Shield, Users } from "lucide-react"
import { useState, useEffect } from "react"

export default function HomePage() {
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-br from-green-400/20 to-emerald-500/20 blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-rose-400/25 to-pink-500/25 blur-2xl animate-bounce"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-violet-400/25 to-purple-500/25 blur-2xl animate-bounce delay-300"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {!session ? (
          <div className="bg-white/95 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-8 shadow-2xl shadow-purple-500/25">
            {/* Logo/Brand Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-orange-500/25">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                ReviewBoard
              </h1>
              <p className="text-gray-700 text-sm font-medium">
                Profesyonel değerlendirme platformuna hoş geldiniz
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-600 font-semibold">Güvenli</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-600 font-semibold">Topluluk</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-violet-500 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-md">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-gray-600 font-semibold">Kaliteli</p>
              </div>
            </div>

            {/* Login Section */}
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Hesabınıza Giriş Yapın
                </h2>
                <p className="text-gray-600 text-sm">
                  Devam etmek için giriş yapmanız gerekiyor
                </p>
              </div>

              <button
                onClick={() => signIn("github")}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-800 to-black hover:from-gray-900 hover:to-gray-800 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl shadow-lg group"
              >
                <Github className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                GitHub ile Giriş Yap
              </button>

              <button
                onClick={() => signIn("email")}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl shadow-lg group"
              >
                <Mail className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Email ile Giriş Yap
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gradient-to-r from-purple-300 to-pink-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">
                    Güvenli Giriş
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 backdrop-blur-xl border-2 border-white/30 rounded-3xl p-8 shadow-2xl shadow-emerald-500/25 text-center">
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl mb-4 shadow-lg shadow-emerald-500/25">
                <User className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                Hoş Geldiniz!
              </h1>
              <p className="text-xl text-gray-800 font-semibold mb-2">
                {session.user?.name || "Kullanıcı"}
              </p>
              <p className="text-gray-600 text-sm font-medium">
                {session.user?.email}
              </p>
            </div>

            

            {/* Action Buttons */}
            <div className="space-y-4">
              
              
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-red-100 to-rose-100 hover:from-red-200 hover:to-rose-200 text-red-700 hover:text-red-800 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] border-2 border-red-200 hover:border-red-300 group shadow-md"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                Çıkış Yap
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/80 text-xs font-medium">
            © 2024 ReviewBoard. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  )
}