import { type ButtonHTMLAttributes } from 'react'
import { cn } from "../../lib/utils.ts";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const variants = {
  primary: 'bg-violet-600 text-white hover:bg-violet-700',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
}

const tapAnimation = {
  sm: 'active:scale-90',
  md: 'active:scale-[0.96]',
  lg: 'active:scale-[0.98]',
}

export function Button({
                         variant = 'primary',
                         size = 'md',
                         isLoading,
                         disabled,
                         className,
                         children,
                         ...props
                       }: ButtonProps) {
  return (
      <button
          disabled={disabled || isLoading}
          className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ease-in-out',

              tapAnimation[size],

              'disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
              variants[variant],
              sizes[size],
              className
          )}
          {...props}
      >
        {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : children}
      </button>
  )
}