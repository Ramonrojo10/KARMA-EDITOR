import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { webhooks } from "@/lib/webhooks"

interface AuthUser {
  email: string
  nombre: string
  rol: string
  avatar: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const VALID_CREDENTIALS = {
  email: "admin@shitoushui.com",
  password: "demo2026",
  user: {
    email: "admin@shitoushui.com",
    nombre: "Administrador",
    rol: "Super Admin",
    avatar: "AD",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("crm_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        sessionStorage.removeItem("crm_user")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (
      email.toLowerCase() === VALID_CREDENTIALS.email &&
      password === VALID_CREDENTIALS.password
    ) {
      setUser(VALID_CREDENTIALS.user)
      sessionStorage.setItem("crm_user", JSON.stringify(VALID_CREDENTIALS.user))
      webhooks.logActividad("login", { usuario: email, email, timestamp: new Date().toISOString() })
      return true
    }
    return false
  }

  const logout = () => {
    webhooks.logActividad("logout", { usuario: user?.email || "unknown" })
    setUser(null)
    sessionStorage.removeItem("crm_user")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
