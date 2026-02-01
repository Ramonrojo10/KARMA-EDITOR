/**
 * Main Layout Component
 * Header, sidebar navigation, and content area
 */

import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  History,
  Youtube,
  Settings,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/youtube', icon: Youtube, label: 'YouTube Studio' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-dark-50">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          {/* Left: Logo & Mobile menu */}
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 hover:bg-dark-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center">
                <span className="text-black font-bold text-lg">K</span>
              </div>
              <h1 className="text-xl font-bold hidden sm:block">
                <span className="text-gradient">KARMA OPS</span>
                <span className="text-white ml-1">EDITOR</span>
              </h1>
            </div>
          </div>

          {/* Golden separator */}
          <div className="hidden md:block flex-1 mx-8">
            <div className="h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
          </div>

          {/* Right: User info */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-dark-100 px-4 py-2 rounded-full">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-gold-500 flex items-center justify-center">
                <User size={16} className="text-black" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                Kevin Belier
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 hover:bg-dark-100 rounded-lg transition-colors text-gray-400 hover:text-red-400"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 flex-col bg-dark-300 border-r border-dark-50">
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-primary-400 border border-primary-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-dark-100'
                }`
              }
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-dark-50">
          <div className="text-xs text-gray-500">
            <p>Shortcuts:</p>
            <p className="mt-1">Ctrl+U: Upload</p>
            <p>Ctrl+H: History</p>
            <p>Esc: Close modal</p>
          </div>
        </div>
      </aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black/80 z-40"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="md:hidden fixed left-0 top-16 bottom-0 w-64 bg-dark-300 border-r border-dark-50 z-50"
            >
              <nav className="p-4 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-600/20 to-primary-500/10 text-primary-400 border border-primary-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-dark-100'
                      }`
                    }
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="md:ml-64 pt-16 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-8"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Layout;
