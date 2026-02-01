/**
 * Settings Page
 * User settings and configuration
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Key,
  Moon,
  Sun,
  Trash2,
  Save,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

function Settings() {
  const { changePassword } = useAuth();

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // API Keys form
  const [apiKeys, setApiKeys] = useState({
    youtubeApiKey: '',
    channelId: '',
  });
  const [savingKeys, setSavingKeys] = useState(false);

  // Dark mode
  const [darkMode, setDarkMode] = useState(true);

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setChangingPassword(true);
    const result = await changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword
    );

    if (result.success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setChangingPassword(false);
  };

  // Handle API keys save
  const handleSaveApiKeys = async (e) => {
    e.preventDefault();
    setSavingKeys(true);

    // In a real app, this would save to the server
    // For now, we'll just show a success message
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('API keys updated');
    setSavingKeys(false);
  };

  // Handle clear cache
  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Cache cleared');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account and preferences.</p>
      </motion.div>

      {/* Change Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-200 rounded-2xl border border-dark-50 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-primary-500/20">
            <Lock size={20} className="text-primary-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Change Password</h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full bg-dark-100 border border-dark-50 rounded-xl px-4 py-3 pr-10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    current: !showPasswords.current,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                className="w-full bg-dark-100 border border-dark-50 rounded-xl px-4 py-3 pr-10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({ ...showPasswords, new: !showPasswords.new })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full bg-dark-100 border border-dark-50 rounded-xl px-4 py-3 pr-10 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords({
                    ...showPasswords,
                    confirm: !showPasswords.confirm,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            loading={changingPassword}
            icon={Save}
          >
            Update Password
          </Button>
        </form>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-200 rounded-2xl border border-dark-50 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gold-500/20">
            <Key size={20} className="text-gold-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">API Configuration</h2>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-300">
            API keys are configured through environment variables on the server.
            Contact your administrator to update these values.
          </p>
        </div>

        <form onSubmit={handleSaveApiKeys} className="space-y-4">
          {/* YouTube API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              YouTube API Key
            </label>
            <input
              type="password"
              value={apiKeys.youtubeApiKey}
              onChange={(e) =>
                setApiKeys({ ...apiKeys, youtubeApiKey: e.target.value })
              }
              placeholder="AIza..."
              className="w-full bg-dark-100 border border-dark-50 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              disabled
            />
          </div>

          {/* Channel ID */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              YouTube Channel ID
            </label>
            <input
              type="text"
              value={apiKeys.channelId}
              onChange={(e) =>
                setApiKeys({ ...apiKeys, channelId: e.target.value })
              }
              placeholder="UC..."
              className="w-full bg-dark-100 border border-dark-50 rounded-xl px-4 py-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              disabled
            />
          </div>

          <Button
            type="submit"
            variant="secondary"
            loading={savingKeys}
            icon={Save}
            disabled
          >
            Save Configuration
          </Button>
        </form>
      </motion.div>

      {/* Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-200 rounded-2xl border border-dark-50 p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6">Preferences</h2>

        {/* Dark mode toggle */}
        <div className="flex items-center justify-between py-4 border-b border-dark-50">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon size={20} className="text-primary-400" />
            ) : (
              <Sun size={20} className="text-gold-400" />
            )}
            <div>
              <p className="font-medium text-white">Dark Mode</p>
              <p className="text-sm text-gray-400">
                {darkMode ? 'Currently enabled' : 'Currently disabled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              darkMode ? 'bg-primary-500' : 'bg-dark-50'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                darkMode ? 'left-8' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Clear cache */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Trash2 size={20} className="text-red-400" />
            <div>
              <p className="font-medium text-white">Clear Cache</p>
              <p className="text-sm text-gray-400">
                Clear local storage and session data
              </p>
            </div>
          </div>
          <Button
            onClick={handleClearCache}
            variant="ghost"
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Clear
          </Button>
        </div>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-gray-500"
      >
        <p>KARMA OPS EDITOR v1.0.0</p>
        <p className="mt-1">Built with React, Express & PostgreSQL</p>
      </motion.div>
    </div>
  );
}

export default Settings;
