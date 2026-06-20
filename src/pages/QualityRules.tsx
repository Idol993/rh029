import { useState } from 'react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import type { QualityRule } from '@/types'

const typeBadgeStyles: Record<string, string> = {
  overrange: 'bg-accent-red-dim text-accent-red',
  zero_drift: 'bg-accent-orange-dim text-accent-orange',
  full_drift: 'bg-accent-yellow-dim text-accent-yellow',
  data_gap: 'bg-accent-blue-dim text-accent-blue',
  constant: 'bg-accent-cyan-dim text-accent-cyan',
  mutation: 'bg-purple-500/20 text-purple-400',
}

const mockTriggerData: Record<string, { lastTriggered: string; triggerCount: number }> = {
  qr1: { lastTriggered: '2026-06-21 05:30', triggerCount: 12 },
  qr2: { lastTriggered: '2026-06-20 14:00', triggerCount: 5 },
  qr3: { lastTriggered: '2026-06-19 09:15', triggerCount: 3 },
  qr4: { lastTriggered: '2026-06-21 06:45', triggerCount: 8 },
  qr5: { lastTriggered: '2026-06-20 22:00', triggerCount: 2 },
  qr6: { lastTriggered: '2026-06-21 04:30', triggerCount: 6 },
}

export default function QualityRules() {
  const { qualityRules } = useStore()
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(
    () => Object.fromEntries(qualityRules.map(r => [r.id, r.enabled]))
  )

  const toggleRule = (id: string) => {
    setEnabledMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="space-y-5">
      <div className="glass-card p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-cyan-dim flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-accent-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary mb-1">质控规则引擎</div>
            <div className="text-xs text-txt-muted leading-relaxed">
              质控规则引擎对监测数据进行自动校验，识别超量程、零点漂移、满度漂移、数据断缺、恒值及突变等异常情况。
              规则触发后将自动标记可疑或无效数据，辅助运维人员进行质控审核，保障数据质量。
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {qualityRules.map((rule: QualityRule) => {
          const enabled = enabledMap[rule.id]
          const trigger = mockTriggerData[rule.id]
          return (
            <div key={rule.id} className={cn('glass-card p-4 space-y-3 transition-opacity', !enabled && 'opacity-60')}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{rule.name}</div>
                  <span className={cn('inline-block px-1.5 py-0.5 rounded text-[10px] font-medium mt-1', typeBadgeStyles[rule.type])}>
                    {rule.typeName}
                  </span>
                </div>
                <button
                  onClick={() => toggleRule(rule.id)}
                  className={cn(
                    'relative w-10 h-5 rounded-full transition-colors',
                    enabled ? 'bg-accent-green' : 'bg-zinc-600'
                  )}
                >
                  <span className={cn(
                    'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                    enabled ? 'left-5.5 translate-x-0' : 'left-0.5'
                  )} />
                </button>
              </div>

              <div className="text-xs text-txt-muted leading-relaxed">{rule.description}</div>

              <div className="flex items-center gap-2 p-2 rounded-md bg-bg-card-hover/50">
                <span className="text-[10px] text-txt-muted">阈值</span>
                <span className="text-xs font-mono stat-value text-accent-cyan">{rule.threshold}</span>
              </div>

              {trigger && (
                <div className="flex items-center justify-between text-[10px] text-txt-muted">
                  <span>最近触发: {trigger.lastTriggered}</span>
                  <span>累计触发: <span className="stat-value text-accent-orange">{trigger.triggerCount}</span> 次</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
