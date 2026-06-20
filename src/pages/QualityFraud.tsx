import { useMemo, useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'
import type { FraudClue } from '@/types'

const fraudColorMap: Record<string, string> = {
  constant_data: 'bg-accent-red-dim text-accent-red',
  mutation_jump: 'bg-accent-orange-dim text-accent-orange',
  reverse_logic: 'bg-accent-yellow-dim text-accent-yellow',
  offline_anomaly: 'bg-accent-red-dim text-accent-red',
  flow_anomaly: 'bg-accent-orange-dim text-accent-orange',
}

function confidenceColor(v: number) {
  if (v > 80) return 'bg-accent-red'
  if (v > 60) return 'bg-accent-orange'
  return 'bg-accent-yellow'
}

function confidenceTextColor(v: number) {
  if (v > 80) return 'text-accent-red'
  if (v > 60) return 'text-accent-orange'
  return 'text-accent-yellow'
}

const statusVariant: Record<string, 'detected' | 'dispatched' | 'verified' | 'dismissed'> = {
  detected: 'detected',
  dispatched: 'dispatched',
  verified: 'verified',
  dismissed: 'dismissed',
}

const alerts = [
  { time: '07:00', text: '永利建材 DEV-G-003 流量异常置信度71%' },
  { time: '06:00', text: '鼎盛电镀 DEV-W-004 离线异常置信度95%' },
  { time: '04:30', text: '华泰化工 DEV-W-001 突变跳变置信度78%' },
  { time: '01:00', text: '绿洲纸业 DEV-W-003 反向逻辑置信度85%' },
  { time: '22:00', text: '恒通钢铁 DEV-G-002 数据恒定置信度92%' },
]

export default function QualityFraud() {
  const { fraudClues, dispatchFraudClue } = useStore()
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  const handleDispatch = useCallback((id: string) => {
    const taskId = dispatchFraudClue(id)
    if (taskId) {
      setToast(`派单成功，执法任务编号: ${taskId}`)
    }
  }, [dispatchFraudClue])

  const stats = useMemo(() => ({
    detected: fraudClues.filter(c => c.status === 'detected').length,
    dispatched: fraudClues.filter(c => c.status === 'dispatched').length,
    verified: fraudClues.filter(c => c.status === 'verified').length,
  }), [fraudClues])

  const radarOption = useMemo(() => {
    const typeCounts: Record<string, number> = {}
    fraudClues.forEach(c => { typeCounts[c.typeName] = (typeCounts[c.typeName] || 0) + 1 })
    const indicators = Object.keys(typeCounts).map(name => ({ name, max: Math.max(...Object.values(typeCounts)) + 1 }))
    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: '#1a2332',
        borderColor: '#2a3548',
        textStyle: { color: '#e8edf5', fontSize: 11 },
      },
      title: {
        text: '造假类型分布',
        textStyle: { color: '#e8edf5', fontSize: 13, fontWeight: 500 },
        left: 0,
        top: 0,
      },
      radar: {
        indicator: indicators,
        shape: 'polygon',
        radius: '65%',
        center: ['50%', '58%'],
        axisName: { color: '#8896ab', fontSize: 10 },
        splitArea: { areaStyle: { color: ['rgba(0,212,170,0.02)', 'rgba(0,212,170,0.04)'] } },
        splitLine: { lineStyle: { color: '#2a3548' } },
        axisLine: { lineStyle: { color: '#2a3548' } },
      },
      series: [{
        type: 'radar',
        data: [{
          value: Object.values(typeCounts),
          name: '线索数',
          areaStyle: { color: 'rgba(255,59,92,0.15)' },
          lineStyle: { color: '#ff3b5c', width: 2 },
          itemStyle: { color: '#ff3b5c' },
        }],
      }],
    }
  }, [fraudClues])

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg bg-accent-green-dim text-accent-green text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="疑似线索" value={stats.detected + stats.dispatched + stats.verified} color="red" pulse />
        <StatCard label="已派单" value={stats.dispatched} color="orange" />
        <StatCard label="已核实" value={stats.verified} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          {fraudClues.map((clue: FraudClue) => (
            <div key={clue.id} className="glass-card p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{clue.enterpriseName}</div>
                  <div className="text-xs text-txt-muted font-mono mt-0.5">{clue.deviceCode}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', fraudColorMap[clue.type])}>
                    {clue.typeName}
                  </span>
                  <StatusBadge variant={statusVariant[clue.status]} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-txt-muted">置信度</span>
                    <span className={cn('text-xs font-mono font-semibold stat-value', confidenceTextColor(clue.confidence))}>
                      {clue.confidence}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-700/50">
                    <div
                      className={cn('h-full rounded-full transition-all', confidenceColor(clue.confidence))}
                      style={{ width: `${clue.confidence}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-xs text-txt-muted leading-relaxed">{clue.description}</div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-txt-muted">检测时间: {clue.detectTime}</span>
                {clue.status === 'detected' ? (
                  <button
                    onClick={() => handleDispatch(clue.id)}
                    className="px-3 py-1 rounded text-[11px] font-medium bg-accent-orange-dim text-accent-orange hover:opacity-80 transition-opacity"
                  >
                    派单核查
                  </button>
                ) : (
                  <button className="px-3 py-1 rounded text-[11px] font-medium bg-accent-cyan-dim text-accent-cyan hover:opacity-80 transition-opacity">
                    查看详情
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <ReactECharts option={radarOption} style={{ height: 260 }} />
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-red pl-3">
              <span className="text-sm font-semibold text-text-primary">AI检测动态</span>
            </div>
            <div className="relative pl-4">
              <div className="absolute left-1 top-1 bottom-1 w-px bg-border" />
              {alerts.map((alert, i) => (
                <div key={i} className="relative pb-3 last:pb-0">
                  <div className="absolute -left-3 top-1 w-2 h-2 rounded-full bg-accent-red border-2 border-bg-card" />
                  <div className="text-[10px] text-txt-muted font-mono mb-0.5">{alert.time}</div>
                  <div className="text-xs text-txt-secondary">{alert.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
