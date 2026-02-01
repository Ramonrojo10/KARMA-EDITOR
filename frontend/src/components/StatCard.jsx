/**
 * Stat Card Component
 * Display a statistic with icon and optional trend
 */

import { motion } from 'framer-motion';

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'primary', // 'primary' | 'gold' | 'green' | 'red'
  index = 0,
}) {
  const colors = {
    primary: {
      bg: 'from-primary-600/20 to-primary-500/10',
      icon: 'bg-primary-500/20 text-primary-400',
      trend: 'text-primary-400',
    },
    gold: {
      bg: 'from-gold-600/20 to-gold-500/10',
      icon: 'bg-gold-500/20 text-gold-400',
      trend: 'text-gold-400',
    },
    green: {
      bg: 'from-green-600/20 to-green-500/10',
      icon: 'bg-green-500/20 text-green-400',
      trend: 'text-green-400',
    },
    red: {
      bg: 'from-red-600/20 to-red-500/10',
      icon: 'bg-red-500/20 text-red-400',
      trend: 'text-red-400',
    },
  };

  const colorConfig = colors[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-6 rounded-2xl border border-dark-50
        bg-gradient-to-br ${colorConfig.bg}
        hover:scale-[1.02] transition-all duration-300
        hover:shadow-lg hover:shadow-primary-500/10
      `}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <motion.p
            className="text-3xl font-bold text-white"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
          >
            {value}
          </motion.p>

          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-sm font-medium ${
                trend >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {trend >= 0 ? '+' : ''}{trend}%
              </span>
              {trendLabel && (
                <span className="text-xs text-gray-500">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        <div className={`p-3 rounded-xl ${colorConfig.icon}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;
