import type { ReactNode } from 'react'
import {cn} from "../../lib/utils.ts";

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'primary' | 'secondary'
  className?: string
}

const variants = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-violet-100 text-violet-700',
  secondary: 'bg-slate-50 text-slate-500 border border-slate-200'
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}
