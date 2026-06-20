import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'
import type { MaintenanceOrder } from '@/types'

type TypeTab = 'all' | 'fault' | 'calibration' | 'maintenance' | 'inspection'
type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'reviewed'

const typeTabs: { key: TypeTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'fault', label: '故障维修' },
  { key: 'calibration', label: '设备校准' },
  { key: 'maintenance', label: '日常维护' },
  { key: 'inspection', label: '设备巡检' },
]

const statusOptions: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: '全部状态' },
  { key: 'pending', label: '待处理' },
  { key: 'in_progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
  { key: 'reviewed', label: '已审核' },
]

const typeIcons: Record<string, string> = {
  fault: '🔧',
  calibration: '📐',
  maintenance: '🛠',
  inspection: '🔍',
}

const statusBadgeVariant: Record<string, 'pending' | 'in_progress' | 'completed' | 'reviewed'> = {
  pending: 'pending',
  in_progress: 'in_progress',
  completed: 'completed',
  reviewed: 'reviewed',
}

export default function MaintenanceOrders() {
  const { maintenanceOrders } = useStore()
  const [typeTab, setTypeTab] = useState<TypeTab>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  const stats = useMemo(() => ({
    pending: maintenanceOrders.filter(o => o.status === 'pending').length,
    inProgress: maintenanceOrders.filter(o => o.status === 'in_progress').length,
    completed: maintenanceOrders.filter(o => o.status === 'completed').length,
    reviewed: maintenanceOrders.filter(o => o.status === 'reviewed').length,
  }), [maintenanceOrders])

  const filtered = useMemo(() => {
    return maintenanceOrders.filter(o => {
      if (typeTab !== 'all' && o.type !== typeTab) return false
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      return true
    })
  }, [maintenanceOrders, typeTab, statusFilter])

  const pieOption = useMemo(() => {
    const counts: Record<string, number> = {}
    maintenanceOrders.forEach(o => { counts[o.typeName] = (counts[o.typeName] || 0) + 1 })
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1a2332',
        borderColor: '#2a3548',
        textStyle: { color: '#e8edf5', fontSize: 11 },
      },
      title: {
        text: '工单类型分布',
        textStyle: { color: '#e8edf5', fontSize: 13, fontWeight: 500 },
        left: 0,
        top: 0,
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '58%'],
        data: Object.entries(counts).map(([name, value]) => ({ name, value })),
        label: { color: '#8896ab', fontSize: 11 },
        itemStyle: { borderColor: '#0f1923', borderWidth: 2 },
        color: ['#ff3b5c', '#3b82f6', '#00d4aa', '#fbbf24'],
      }],
    }
  }, [maintenanceOrders])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="待处理" value={stats.pending} color="orange" pulse />
        <StatCard label="进行中" value={stats.inProgress} color="blue" />
        <StatCard label="已完成" value={stats.completed} color="green" />
        <StatCard label="已审核" value={stats.reviewed} color="cyan" />
      </div>

      <div className="glass-card p-4">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            {typeTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setTypeTab(tab.key)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                  typeTab === tab.key
                    ? 'bg-accent-cyan-dim text-accent-cyan'
                    : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-card-hover'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="bg-bg-card border border-border rounded-md px-3 py-1.5 text-xs text-txt-secondary focus:outline-none focus:border-accent-cyan"
          >
            {statusOptions.map(opt => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filtered.map((order: MaintenanceOrder) => (
            <div key={order.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{typeIcons[order.type]}</span>
                  <span className="text-sm font-semibold text-text-primary">{order.typeName}</span>
                  <span className="text-xs text-txt-muted">|</span>
                  <span className="text-xs text-txt-secondary font-mono">{order.deviceCode}</span>
                </div>
                <StatusBadge variant={statusBadgeVariant[order.status]} />
              </div>
              <div className="text-xs text-txt-secondary mb-2">{order.enterpriseName}</div>
              <div className="text-xs text-txt-muted mb-2">{order.description}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-txt-muted">
                  <span>运维人: {order.operator}</span>
                  <span>创建: {order.createTime}</span>
                  {order.completeTime && <span>完成: {order.completeTime}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {order.status === 'pending' && (
                    <button className="px-3 py-1 rounded text-[11px] font-medium bg-accent-orange-dim text-accent-orange hover:opacity-80 transition-opacity">
                      处理
                    </button>
                  )}
                  {order.status === 'in_progress' && (
                    <button className="px-3 py-1 rounded text-[11px] font-medium bg-accent-green-dim text-accent-green hover:opacity-80 transition-opacity">
                      完成
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <button className="px-3 py-1 rounded text-[11px] font-medium bg-accent-cyan-dim text-accent-cyan hover:opacity-80 transition-opacity">
                      审核
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <ReactECharts option={pieOption} style={{ height: 280 }} />
      </div>
    </div>
  )
}
