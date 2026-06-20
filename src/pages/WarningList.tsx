import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import type { WarningEvent, WarningLevel } from '@/types'

const typeTabs = [
  { key: 'all', label: '全部' },
  { key: 'exceed', label: '浓度超标' },
  { key: 'facility_stop', label: '设施停运' },
  { key: 'data_anomaly', label: '数据异常' },
  { key: 'fraud_suspect', label: '疑似造假' },
] as const

const statusOptions = [
  { key: 'all', label: '全部状态' },
  { key: 'pending', label: '待处置' },
  { key: 'processing', label: '处置中' },
  { key: 'resolved', label: '已解决' },
  { key: 'closed', label: '已关闭' },
] as const

const levelBorder: Record<WarningLevel, string> = {
  red: 'border-l-accent-red',
  orange: 'border-l-accent-orange',
  yellow: 'border-l-accent-yellow',
}

function WarningCard({ event }: { event: WarningEvent }) {
  return (
    <div className={cn('glass-card p-4 border-l-4', levelBorder[event.level])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge variant={event.level} pulse={event.status === 'pending'} />
            <span className="text-xs text-txt-secondary px-1.5 py-0.5 rounded bg-[#1a2332] border border-[#2a3548]">
              {event.typeName}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-primary font-medium">{event.enterpriseName}</span>
            <span className="text-txt-muted text-xs">{event.outletCode}</span>
          </div>
          {event.pollutantName !== '-' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-txt-secondary">{event.pollutantName}</span>
              <span className="text-accent-red font-semibold stat-value">
                {event.exceedValue}{event.unit}
              </span>
              <span className="text-txt-muted">/ 限值</span>
              <span className="text-txt-secondary">{event.limitValue}{event.unit}</span>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-txt-muted">
            <span>触发时间: {event.triggerTime}</span>
            {event.handler && <span>处置人: {event.handler}</span>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge variant={event.status} />
          <button
            className={cn(
              'px-3 py-1 rounded text-xs font-medium transition-all',
              event.status === 'pending'
                ? 'bg-accent-red text-white hover:bg-accent-red/80'
                : 'bg-[#2a3548] text-txt-secondary hover:bg-[#374357] hover:text-text-primary'
            )}
          >
            {event.status === 'pending' ? '处置' : '查看'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WarningList() {
  const { warningEvents, stats } = useStore()
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    return warningEvents.filter((e) => {
      if (typeFilter !== 'all' && e.type !== typeFilter) return false
      if (statusFilter !== 'all' && e.status !== statusFilter) return false
      return true
    })
  }, [warningEvents, typeFilter, statusFilter])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="红色预警" value={stats.redWarnings} color="red" pulse />
        <StatCard label="橙色预警" value={stats.orangeWarnings} color="orange" pulse />
        <StatCard label="黄色预警" value={stats.yellowWarnings} color="yellow" pulse />
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 flex-wrap">
            {typeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={cn(
                  'px-3 py-1.5 rounded text-xs font-medium transition-all',
                  typeFilter === tab.key
                    ? 'bg-accent-green-dim text-accent-green'
                    : 'text-txt-muted hover:text-text-secondary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#1a2332] border border-[#2a3548] rounded px-3 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-accent-green"
          >
            {statusOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="glass-card p-8 text-center text-txt-muted text-sm">
            暂无匹配的预警事件
          </div>
        )}
        {filtered.map((event) => (
          <WarningCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}
