/**
 * Button Component
 * Reusable button with variants and loading state
 */

import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient'
  size = 'md', // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white border-primary-500',
    secondary: 'bg-dark-100 hover:bg-dark-50 text-white border-dark-50',
    ghost: 'bg-transparent hover:bg-dark-100 text-gray-300 border-transparent',
    danger: 'bg-red-600 hover:bg-red-700 text-white border-red-500',
    gradient: 'bg-gradient-to-r from-primary-600 via-primary-500 to-gold-500 text-white border-transparent hover:opacity-90',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-xl border
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-black
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon size={iconSizes[size]} />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon size={iconSizes[size]} />
          )}
        </>
      )}
    </motion.button>
  );
}

/**
 * Gradient button with animated border
 */
export function GradientButton({
  children,
  onClick,
  loading = false,
  disabled = false,
  icon: Icon,
  fullWidth = false,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      className={`
        relative group inline-flex items-center justify-center gap-3
        px-8 py-4 text-lg font-semibold text-white
        rounded-2xl overflow-hidden
        transition-all duration-300
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary-600 via-primary-500 to-gold-500"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/50 via-gold-500/50 to-primary-500/50 blur-xl" />
      </div>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-3">
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            {Icon && <Icon size={24} />}
            {children}
          </>
        )}
      </span>
    </motion.button>
  );
}

export default Button;
