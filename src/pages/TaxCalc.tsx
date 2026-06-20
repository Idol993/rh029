import { useMemo, useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'
import { Calculator, Building2, CheckCircle, FileText } from 'lucide-react'

const axisColor = '#8896ab'
const splitColor = '#2a3548'

export default function TaxCalc() {
  const { taxRecords, enterprises, declareTax } = useStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    const calculatedIds = taxRecords.filter(r => r.status === 'calculated').map(r => r.id)
    setSelectedIds(prev => {
      const allSelected = calculatedIds.every(id => prev.has(id))
      if (allSelected) return new Set<string>()
      return new Set(calculatedIds)
    })
  }, [taxRecords])

  const handleDeclare = useCallback(() => {
    if (selectedIds.size === 0) return
    declareTax(Array.from(selectedIds))
    setToast(`已确认申报${selectedIds.size}条记录`)
    setSelectedIds(new Set())
  }, [selectedIds, declareTax])

  const totalTax = useMemo(() => taxRecords.reduce((s, r) => s + r.taxAmount, 0), [taxRecords])
  const paidTotal = useMemo(() => taxRecords.filter(r => r.status === 'paid').reduce((s, r) => s + r.taxAmount, 0), [taxRecords])
  const declaredCount = useMemo(() => new Set(taxRecords.map(r => r.enterpriseName)).size, [taxRecords])
  const pendingTotal = useMemo(() => taxRecords.filter(r => r.status === 'calculated').reduce((s, r) => s + r.taxAmount, 0), [taxRecords])

  const barOption = useMemo(() => {
    const map = new Map<string, number>()
    taxRecords.forEach(r => map.set(r.enterpriseName, (map.get(r.enterpriseName) || 0) + r.taxAmount))
    const sorted = [...map.entries()].sort((a, b) => a[1] - b[1])
    const names = sorted.map(([n]) => n.length > 6 ? n.slice(0, 6) + '…' : n)
    const values = sorted.map(([, v]) => v)
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#2a3548', textStyle: { color: '#e8edf5' } },
      grid: { top: 8, right: 56, bottom: 8, left: 80 },
      xAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitColor, type: 'dashed' } } },
      yAxis: { type: 'category', data: names, axisLine: { show: false }, axisLabel: { color: axisColor, fontSize: 11 }, axisTick: { show: false } },
      series: [{
        type: 'bar',
        data: values.map((v, i) => ({
          value: Math.round(v * 100) / 100,
          itemStyle: { color: i % 2 === 0 ? '#00d4aa' : '#06b6d4', borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: 18,
        label: { show: true, position: 'right', color: axisColor, fontSize: 10, formatter: '{c}元' },
      }],
    }
  }, [taxRecords])

  const calculatedRecords = useMemo(() => taxRecords.filter(r => r.status === 'calculated'), [taxRecords])

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg bg-accent-green-dim text-accent-green text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="本月税额合计" value={totalTax.toLocaleString()} unit="元" icon={<Calculator className="w-4 h-4 text-accent-green" />} color="green" />
        <StatCard label="申报企业数" value={declaredCount} icon={<Building2 className="w-4 h-4 text-accent-cyan" />} color="cyan" />
        <StatCard label="已缴纳" value={paidTotal.toLocaleString()} unit="元" icon={<CheckCircle className="w-4 h-4 text-accent-blue" />} color="blue" />
        <StatCard label="待申报" value={pendingTotal.toLocaleString()} unit="元" icon={<FileText className="w-4 h-4 text-accent-orange" />} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-green pl-3">
            <span className="text-sm font-semibold text-text-primary">税额明细</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-center py-2 px-3 text-txt-secondary font-medium w-10">
                    {calculatedRecords.length > 0 && (
                      <input
                        type="checkbox"
                        checked={calculatedRecords.length > 0 && calculatedRecords.every(r => selectedIds.has(r.id))}
                        onChange={toggleAll}
                        className="accent-accent-green"
                      />
                    )}
                  </th>
                  <th className="text-left py-2 px-3 text-txt-secondary font-medium">企业名称</th>
                  <th className="text-left py-2 px-3 text-txt-secondary font-medium">税期</th>
                  <th className="text-left py-2 px-3 text-txt-secondary font-medium">污染物类型</th>
                  <th className="text-right py-2 px-3 text-txt-secondary font-medium">排放量(kg)</th>
                  <th className="text-right py-2 px-3 text-txt-secondary font-medium">当量值</th>
                  <th className="text-right py-2 px-3 text-txt-secondary font-medium">单价(元)</th>
                  <th className="text-right py-2 px-3 text-txt-secondary font-medium">税额(元)</th>
                  <th className="text-center py-2 px-3 text-txt-secondary font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {taxRecords.map(r => (
                  <tr key={r.id} className={cn(
                    'border-b border-[var(--border)]/50 hover:bg-[var(--bg-card-hover)] transition-colors',
                    selectedIds.has(r.id) && 'bg-accent-green/5'
                  )}>
                    <td className="py-2.5 px-3 text-center">
                      {r.status === 'calculated' && (
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.id)}
                          onChange={() => toggleSelect(r.id)}
                          className="accent-accent-green"
                        />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-text-primary">{r.enterpriseName}</td>
                    <td className="py-2.5 px-3 text-txt-secondary">{r.period}</td>
                    <td className="py-2.5 px-3 text-text-primary">{r.pollutantType}</td>
                    <td className="py-2.5 px-3 text-right stat-value text-text-primary">{r.emission.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right stat-value text-text-primary">{r.equivalentValue}</td>
                    <td className="py-2.5 px-3 text-right text-txt-secondary">{r.unitPrice}</td>
                    <td className="py-2.5 px-3 text-right stat-value text-accent-green">{r.taxAmount.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-center"><StatusBadge variant={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedIds.size > 0 && (
            <div className="mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg bg-accent-green/5 border border-accent-green/20">
              <span className="text-xs text-txt-secondary">已选择 <span className="stat-value text-accent-green">{selectedIds.size}</span> 条已核算记录</span>
              <button
                onClick={handleDeclare}
                className="px-4 py-1.5 rounded-md text-xs font-medium bg-accent-green text-white hover:bg-accent-green/90 transition-colors"
              >
                确认申报 ({selectedIds.size}条)
              </button>
            </div>
          )}
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-cyan pl-3">
            <span className="text-sm font-semibold text-text-primary">各企业税额对比</span>
          </div>
          <ReactECharts option={barOption} style={{ height: 320 }} />
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-green pl-3">
          <span className="text-sm font-semibold text-text-primary">核算公式说明</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent-green-dim">
            <span className="text-[11px] text-txt-secondary">排放量</span>
            <span className="stat-value text-sm text-accent-green">2,450 kg</span>
          </div>
          <span className="text-txt-muted text-lg">→</span>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent-cyan-dim">
            <span className="text-[11px] text-txt-secondary">当量值换算</span>
            <span className="stat-value text-sm text-accent-cyan">÷1 = 2,450</span>
          </div>
          <span className="text-txt-muted text-lg">→</span>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent-blue-dim">
            <span className="text-[11px] text-txt-secondary">适用税额</span>
            <span className="stat-value text-sm text-accent-blue">×1.4元</span>
          </div>
          <span className="text-txt-muted text-lg">→</span>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent-orange-dim">
            <span className="text-[11px] text-txt-secondary">应纳税额</span>
            <span className="stat-value text-sm text-accent-orange">3,430元</span>
          </div>
        </div>
        <p className="text-[11px] text-txt-muted mt-3">
          应纳税额 = 排放量 ÷ 污染当量值 × 适用税额 | 大气污染物每污染当量1.2元，水污染物每污染当量1.4元
        </p>
      </div>
    </div>
  )
}
