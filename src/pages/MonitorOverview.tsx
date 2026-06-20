import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { Droplets, Wind, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmissionFilter = 'all' | 'water' | 'gas'
type StatusFilter = 'all' | 'online' | 'offline' | 'maintenance'

export default function MonitorOverview() {
  const { outlets, enterprises } = useStore()
  const [emissionFilter, setEmissionFilter] = useState<EmissionFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const filtered = useMemo(() => {
    return outlets.filter((o) => {
      if (emissionFilter !== 'all' && o.emissionType !== emissionFilter) return false
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      return true
    })
  }, [outlets, emissionFilter, statusFilter])

  const waterCount = outlets.filter((o) => o.emissionType === 'water').length
  const gasCount = outlets.filter((o) => o.emissionType === 'gas').length
  const onlineCount = outlets.filter((o) => o.status === 'online').length
  const offlineCount = outlets.filter((o) => o.status !== 'online').length

  const emissionTabs: { key: EmissionFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'water', label: '废水' },
    { key: 'gas', label: '废气' },
  ]

  const statusOptions: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: '全部状态' },
    { key: 'online', label: '在线' },
    { key: 'offline', label: '离线' },
    { key: 'maintenance', label: '维护' },
  ]

  const statusVariantMap: Record<string, 'online' | 'offline' | 'maintenance'> = {
    online: 'online',
    offline: 'offline',
    maintenance: 'maintenance',
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="废水排口数"
          value={waterCount}
          icon={<Droplets className="w-4 h-4 text-accent-cyan" />}
          color="cyan"
        />
        <StatCard
          label="废气排口数"
          value={gasCount}
          icon={<Wind className="w-4 h-4 text-accent-orange" />}
          color="orange"
        />
        <StatCard
          label="在线数"
          value={onlineCount}
          icon={<Wifi className="w-4 h-4 text-accent-green" />}
          color="green"
        />
        <StatCard
          label="离线/故障数"
          value={offlineCount}
          icon={<WifiOff className="w-4 h-4 text-accent-red" />}
          color="red"
          pulse
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-bg-secondary rounded-md p-0.5 border border-border">
          {emissionTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setEmissionFilter(tab.key)}
              className={cn(
                'px-4 py-1.5 text-xs font-medium rounded transition-colors',
                emissionFilter === tab.key
                  ? 'bg-accent-green text-bg-primary'
                  : 'text-txt-secondary hover:text-text-primary'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="bg-bg-secondary border border-border rounded-md px-3 py-1.5 text-xs text-txt-secondary focus:outline-none focus:border-accent-green"
        >
          {statusOptions.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((outlet) => (
          <div key={outlet.id} className="glass-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {outlet.emissionType === 'water' ? (
                  <Droplets className="w-4 h-4 text-accent-cyan" />
                ) : (
                  <Wind className="w-4 h-4 text-accent-orange" />
                )}
                <span className="text-xs font-mono text-txt-secondary">{outlet.code}</span>
              </div>
              <StatusBadge variant={statusVariantMap[outlet.status] || 'offline'} />
            </div>
            <div className="text-sm font-medium text-text-primary">{outlet.enterpriseName}</div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(outlet.permitLimits).map(([key, limit]) => (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-bg-secondary text-txt-secondary border border-border"
                >
                  {key} ≤ {limit}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-txt-muted pt-1 border-t border-border">
              <span>{outlet.location}</span>
              <span>{outlet.treatmentProcess}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
