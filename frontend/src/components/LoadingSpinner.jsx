/**
 * Loading Spinner Component
 * Animated purple/gold gradient spinner
 */

import { motion } from 'framer-motion';

function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  const borderSizes = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-[6px]',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative">
        {/* Outer glow */}
        <motion.div
          className={`${sizes[size]} rounded-full absolute inset-0`}
          animate={{
            boxShadow: [
              '0 0 20px rgba(139, 92, 246, 0.4)',
              '0 0 40px rgba(255, 215, 0, 0.4)',
              '0 0 20px rgba(139, 92, 246, 0.4)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Spinning border */}
        <motion.div
          className={`${sizes[size]} rounded-full ${borderSizes[size]} border-transparent`}
          style={{
            background: 'linear-gradient(white, white) padding-box, conic-gradient(from 0deg, #8B5CF6, #FFD700, #8B5CF6) border-box',
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Inner circle */}
        <div
          className={`absolute inset-1 rounded-full bg-black`}
        />

        {/* Center glow */}
        <motion.div
          className="absolute inset-2 rounded-full"
          animate={{
            background: [
              'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
              'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {text && (
        <motion.p
          className="text-gray-400 text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Full page loading overlay
 */
export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <motion.p
          className="mt-6 text-lg text-white"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {text}
        </motion.p>
      </div>
    </motion.div>
  );
}

/**
 * Skeleton loader for content
 */
export function Skeleton({ className = '', variant = 'text' }) {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'w-10 h-10 rounded-full',
    thumbnail: 'aspect-video rounded-lg',
    card: 'h-40 rounded-xl',
  };

  return (
    <div className={`skeleton bg-dark-100 ${variants[variant]} ${className}`} />
  );
}

export default LoadingSpinner;
