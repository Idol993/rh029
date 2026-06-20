import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  icon?: ReactNode
  trend?: { value: number; label: string }
  color?: 'green' | 'red' | 'orange' | 'yellow' | 'blue' | 'cyan'
  pulse?: boolean
  className?: string
}

const colorMap = {
  green: { text: 'text-accent-green', bg: 'bg-accent-green-dim', glow: 'shadow-[0_0_20px_rgba(0,212,170,0.15)]' },
  red: { text: 'text-accent-red', bg: 'bg-accent-red-dim', glow: 'shadow-[0_0_20px_rgba(255,59,92,0.15)]' },
  orange: { text: 'text-accent-orange', bg: 'bg-accent-orange-dim', glow: 'shadow-[0_0_20px_rgba(255,107,53,0.15)]' },
  yellow: { text: 'text-accent-yellow', bg: 'bg-accent-yellow-dim', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]' },
  blue: { text: 'text-accent-blue', bg: 'bg-accent-blue-dim', glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
  cyan: { text: 'text-accent-cyan', bg: 'bg-accent-cyan-dim', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]' },
}

export default function StatCard({ label, value, unit, icon, trend, color = 'green', pulse, className }: StatCardProps) {
  const c = colorMap[color]

  return (
    <div className={cn('glass-card p-4 relative overflow-hidden', c.glow, pulse && 'animate-pulse-green', className)}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-txt-secondary font-medium">{label}</span>
        {icon && <div className={cn('w-8 h-8 rounded-md flex items-center justify-center', c.bg)}>{icon}</div>}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={cn('stat-value text-2xl', c.text)}>{value}</span>
        {unit && <span className="text-xs text-txt-muted">{unit}</span>}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span className={cn('text-[10px] font-medium', trend.value >= 0 ? 'text-accent-red' : 'text-accent-green')}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className="text-[10px] text-txt-muted">{trend.label}</span>
        </div>
      )}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-5" style={{ background: `radial-gradient(circle, var(--accent-${color}) 0%, transparent 70%)` }} />
    </div>
  )
}
