import { cn } from '@/lib/utils'

type BadgeVariant = 'online' | 'offline' | 'fault' | 'maintenance' | 'pending' | 'processing' | 'resolved' | 'closed' | 'red' | 'orange' | 'yellow' | 'green' | 'calculated' | 'declared' | 'paid' | 'assigned' | 'in_progress' | 'completed' | 'reviewed' | 'detected' | 'dispatched' | 'verified' | 'dismissed'

const variantStyles: Record<BadgeVariant, string> = {
  online: 'bg-accent-green-dim text-accent-green',
  offline: 'bg-zinc-700/50 text-zinc-400',
  fault: 'bg-accent-red-dim text-accent-red',
  maintenance: 'bg-accent-yellow-dim text-accent-yellow',
  pending: 'bg-accent-orange-dim text-accent-orange',
  processing: 'bg-accent-blue-dim text-accent-blue',
  resolved: 'bg-accent-green-dim text-accent-green',
  closed: 'bg-zinc-700/50 text-zinc-400',
  red: 'bg-accent-red-dim text-accent-red',
  orange: 'bg-accent-orange-dim text-accent-orange',
  yellow: 'bg-accent-yellow-dim text-accent-yellow',
  green: 'bg-accent-green-dim text-accent-green',
  calculated: 'bg-accent-cyan-dim text-accent-cyan',
  declared: 'bg-accent-blue-dim text-accent-blue',
  paid: 'bg-accent-green-dim text-accent-green',
  assigned: 'bg-accent-orange-dim text-accent-orange',
  in_progress: 'bg-accent-blue-dim text-accent-blue',
  completed: 'bg-accent-green-dim text-accent-green',
  reviewed: 'bg-accent-cyan-dim text-accent-cyan',
  detected: 'bg-accent-red-dim text-accent-red',
  dispatched: 'bg-accent-orange-dim text-accent-orange',
  verified: 'bg-accent-yellow-dim text-accent-yellow',
  dismissed: 'bg-zinc-700/50 text-zinc-400',
}

const variantLabels: Record<BadgeVariant, string> = {
  online: '在线', offline: '离线', fault: '故障', maintenance: '维护',
  pending: '待处置', processing: '处置中', resolved: '已解决', closed: '已关闭',
  red: '红色预警', orange: '橙色预警', yellow: '黄色预警', green: '正常',
  calculated: '已核算', declared: '已申报', paid: '已缴纳',
  assigned: '已派单', in_progress: '进行中', completed: '已完成', reviewed: '已审核',
  detected: '已识别', dispatched: '已派单', verified: '已核实', dismissed: '已排除',
}

interface StatusBadgeProps {
  variant: BadgeVariant
  label?: string
  pulse?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ variant, label, pulse, className, size = 'md' }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 rounded font-medium whitespace-nowrap',
      size === 'sm' ? 'py-0.5 text-[10px] px-1.5' : 'py-0.5 text-[11px]',
      variantStyles[variant],
      pulse && variant === 'red' && 'animate-pulse-red',
      pulse && variant === 'orange' && 'animate-pulse-orange',
      className
    )}>
      {(pulse && (variant === 'red' || variant === 'orange' || variant === 'pending')) && (
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      )}
      {label || variantLabels[variant]}
    </span>
  )
}
