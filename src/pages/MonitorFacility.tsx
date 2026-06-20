import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'

interface FacilityItem {
  label: string
  running: boolean
}

const equipTableData = [
  { name: '曝气风机', spec: 'FSR-150', power: '15kW', runtime: '8620h', lastMaint: '2026-05-20' },
  { name: '提升水泵', spec: 'WQ-80', power: '7.5kW', runtime: '6540h', lastMaint: '2026-06-10' },
  { name: '加药计量泵', spec: 'JM-25', power: '0.75kW', runtime: '4320h', lastMaint: '2026-06-05' },
  { name: '污泥回流泵', spec: 'WQ-50', power: '5.5kW', runtime: '7280h', lastMaint: '2026-04-18' },
  { name: '罗茨风机', spec: 'RSR-125', power: '22kW', runtime: '9850h', lastMaint: '2026-03-25' },
]

export default function MonitorFacility() {
  const { facilityStatuses } = useStore()

  const hasAlert = (fs: typeof facilityStatuses[number]) =>
    fs.productionOnline && (!fs.fanRunning || !fs.pumpRunning || !fs.dosingRunning)

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {facilityStatuses.map((fs) => {
          const alert = hasAlert(fs)
          const items: FacilityItem[] = [
            { label: '风机', running: fs.fanRunning },
            { label: '泵', running: fs.pumpRunning },
            { label: '加药', running: fs.dosingRunning },
          ]
          return (
            <div
              key={fs.id}
              className={cn(
                'glass-card p-4 space-y-3',
                alert && 'border-accent-red border-2 shadow-[0_0_20px_rgba(255,59,92,0.15)]'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{fs.enterpriseName}</span>
                {alert && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-accent-red-dim text-accent-red font-medium animate-pulse-red">
                    <AlertTriangle className="w-3 h-3" />
                    异常预警
                  </span>
                )}
              </div>

              <div className="flex gap-4">
                {items.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        'w-2 h-2 rounded-full',
                        item.running ? 'bg-accent-green shadow-[0_0_6px_rgba(0,212,170,0.5)]' : 'bg-accent-red shadow-[0_0_6px_rgba(255,59,92,0.5)]'
                      )}
                    />
                    <span className="text-xs text-txt-secondary">{item.label}</span>
                    <span className={cn('text-[10px]', item.running ? 'text-accent-green' : 'text-accent-red')}>
                      {item.running ? '运行' : '停运'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-6 text-xs">
                <div>
                  <span className="text-txt-muted">电压</span>
                  <span className="ml-2 stat-value text-text-primary">{fs.voltage}</span>
                  <span className="text-txt-muted ml-0.5">V</span>
                </div>
                <div>
                  <span className="text-txt-muted">采样流量</span>
                  <span className="ml-2 stat-value text-text-primary">{fs.sampleFlow}</span>
                  <span className="text-txt-muted ml-0.5">L/min</span>
                </div>
              </div>

              {alert && (
                <div className="flex items-center gap-2 px-3 py-2 rounded bg-accent-red-dim/50 border border-accent-red/30">
                  <AlertTriangle className="w-3.5 h-3.5 text-accent-red flex-shrink-0" />
                  <span className="text-[11px] text-accent-red font-medium">生产在线+治污停运=异常预警</span>
                </div>
              )}

              <div className="text-[10px] text-txt-muted">
                更新于 {new Date(fs.timestamp).toLocaleString('zh-CN')}
              </div>
            </div>
          )
        })}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-green pl-3">
          <span className="text-sm font-semibold text-text-primary">设备参数表</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-txt-muted border-b border-border">
                <th className="text-left py-2 px-3 font-medium">设备名称</th>
                <th className="text-left py-2 px-3 font-medium">规格型号</th>
                <th className="text-left py-2 px-3 font-medium">功率</th>
                <th className="text-left py-2 px-3 font-medium">累计运行</th>
                <th className="text-left py-2 px-3 font-medium">上次维护</th>
              </tr>
            </thead>
            <tbody>
              {equipTableData.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-bg-card-hover transition-colors">
                  <td className="py-2 px-3 text-text-primary">{row.name}</td>
                  <td className="py-2 px-3 text-txt-secondary font-mono">{row.spec}</td>
                  <td className="py-2 px-3 text-txt-secondary">{row.power}</td>
                  <td className="py-2 px-3 text-txt-secondary font-mono stat-value">{row.runtime}</td>
                  <td className="py-2 px-3 text-txt-secondary">{row.lastMaint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
