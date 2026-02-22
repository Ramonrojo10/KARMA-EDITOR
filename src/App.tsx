import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import ProtectedRoute from "@/components/crm/ProtectedRoute"
import CRMLayout from "@/components/crm/CRMLayout"
import LandingPage from "@/pages/LandingPage"
import LoginPage from "@/pages/LoginPage"
import DashboardPage from "@/pages/crm/DashboardPage"
import LeadsPage from "@/pages/crm/LeadsPage"
import EmbajadoresPage from "@/pages/crm/EmbajadoresPage"
import PropiedadesPage from "@/pages/crm/PropiedadesPage"
import CobranzaPage from "@/pages/crm/CobranzaPage"
import ChatPage from "@/pages/crm/ChatPage"
import ConfiguracionPage from "@/pages/crm/ConfiguracionPage"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected CRM routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/crm" element={<CRMLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="leads" element={<LeadsPage />} />
              <Route path="embajadores" element={<EmbajadoresPage />} />
              <Route path="propiedades" element={<PropiedadesPage />} />
              <Route path="cobranza" element={<CobranzaPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  )
}
