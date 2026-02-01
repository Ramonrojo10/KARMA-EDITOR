/**
 * KARMA OPS EDITOR - Main App Component
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Processing from './pages/Processing';
import History from './pages/History';
import YouTube from './pages/YouTube';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl/Cmd key combinations
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key.toLowerCase()) {
          case 'u':
            e.preventDefault();
            window.location.href = '/upload';
            break;
          case 'h':
            e.preventDefault();
            window.location.href = '/history';
            break;
        }
      }

      // Escape key to close modals (handled by individual components)
      if (e.key === 'Escape') {
        document.dispatchEvent(new CustomEvent('close-modal'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<Upload />} />
        <Route path="processing/:videoId" element={<Processing />} />
        <Route path="history" element={<History />} />
        <Route path="youtube" element={<YouTube />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
