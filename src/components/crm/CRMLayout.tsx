import { useState, useEffect } from "react"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Building2,
  LayoutDashboard,
  Users,
  Award,
  Home,
  CreditCard,
  MessageSquareMore,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { to: "/crm", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/crm/leads", icon: Users, label: "Leads" },
  { to: "/crm/embajadores", icon: Award, label: "Embajadores" },
  { to: "/crm/propiedades", icon: Home, label: "Propiedades" },
  { to: "/crm/cobranza", icon: CreditCard, label: "Cobranza" },
  { to: "/crm/chat", icon: MessageSquareMore, label: "Chat IA" },
  { to: "/crm/configuracion", icon: Settings, label: "Configuración" },
]

export default function CRMLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const currentPage = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label || "CRM"

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col bg-card border-r border-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-border shrink-0",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <span className="font-bold text-sm">
                <span className="gold-gradient">Shitoushui</span>
              </span>
            </div>
          )}
          {collapsed && <Building2 className="h-5 w-5 text-primary" />}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "nav-item",
                  isActive && "nav-item-active",
                  collapsed && "justify-center px-0"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className={cn(
          "p-3 border-t border-border",
          collapsed ? "flex justify-center" : ""
        )}>
          {!collapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{user?.avatar || "AD"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.nombre}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* ─── MAIN AREA ───────────────────────────────────────────────────── */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 min-h-screen",
          collapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center px-4 sm:px-6 gap-4">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex-1">
            <h1 className="font-semibold text-base sm:text-lg">{currentPage}</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Shitoushui Inmobiliaria · CRM
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-primary rounded-full" />
            </button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>{user?.avatar || "AD"}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground">{user?.rol}</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
