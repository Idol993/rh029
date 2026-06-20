import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { cn } from '@/lib/utils'

type FilterTab = 'all' | 'online' | 'fault' | 'offline' | 'maintenance'

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'online', label: '在线' },
  { key: 'fault', label: '故障' },
  { key: 'offline', label: '离线' },
  { key: 'maintenance', label: '维护中' },
]

const statusMap: Record<string, 'online' | 'offline' | 'fault' | 'maintenance'> = {
  online: 'online',
  offline: 'offline',
  fault: 'fault',
  maintenance: 'maintenance',
}

function isExpiringSoon(expiry: string) {
  const diff = new Date(expiry).getTime() - Date.now()
  return diff > 0 && diff < 30 * 24 * 3600 * 1000
}

export default function MaintenanceDevices() {
  const { devices } = useStore()
  const [activeTab, setActiveTab] = useState<FilterTab>('all')

  const stats = useMemo(() => ({
    total: devices.length,
    online: devices.filter(d => d.status === 'online').length,
    fault: devices.filter(d => d.status === 'fault').length,
    offline: devices.filter(d => d.status === 'offline').length,
  }), [devices])

  const filtered = useMemo(() => {
    if (activeTab === 'all') return devices
    if (activeTab === 'maintenance') return devices.filter(d => d.status === 'maintenance')
    return devices.filter(d => d.status === activeTab)
  }, [devices, activeTab])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="设备总数" value={stats.total} color="cyan" />
        <StatCard label="在线" value={stats.online} color="green" />
        <StatCard label="故障" value={stats.fault} color="red" pulse />
        <StatCard label="离线" value={stats.offline} color="orange" />
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-1 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-4 py-1.5 rounded-md text-xs font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-accent-cyan-dim text-accent-cyan'
                  : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-card-hover'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(device => (
            <div key={device.id} className="glass-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{device.deviceCode}</div>
                  <div className="text-xs text-txt-muted mt-0.5">{device.model}</div>
                </div>
                <StatusBadge variant={statusMap[device.status]} />
              </div>

              <div className="text-xs text-txt-secondary">{device.enterpriseName}</div>

              <div className="flex flex-wrap gap-1">
                {device.pollutants.map(p => (
                  <span key={p} className="px-1.5 py-0.5 rounded text-[10px] bg-accent-cyan-dim/40 text-accent-cyan">
                    {p}
                  </span>
                ))}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-txt-muted">运维单位</span>
                  <span className="text-txt-secondary">{device.maintenanceUnit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-txt-muted">校准到期</span>
                  <span className={cn(
                    'font-mono',
                    isExpiringSoon(device.calibrationExpiry) ? 'text-accent-yellow font-semibold' : 'text-txt-secondary'
                  )}>
                    {device.calibrationExpiry}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-txt-muted">安装位置</span>
                  <span className="text-txt-secondary">{device.installLocation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
