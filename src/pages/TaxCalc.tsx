import { useMemo, useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'
import { Calculator, Building2, CheckCircle, FileText, Eye, X, ChevronDown, ChevronUp, History } from 'lucide-react'
import type { TaxDeclaration } from '@/types'

const axisColor = '#8896ab'
const splitColor = '#2a3548'

export default function TaxCalc() {
  const { taxRecords, taxDeclarations, enterprises, generateDeclaration, confirmDeclaration } = useStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [previewDecl, setPreviewDecl] = useState<TaxDeclaration | null>(null)
  const [expandedDeclIds, setExpandedDeclIds] = useState<Set<string>>(new Set())

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

  const handleGeneratePreview = useCallback(() => {
    if (selectedIds.size === 0) return
    const ids = Array.from(selectedIds)
    const declId = generateDeclaration(ids)
    const decl = useStore.getState().taxDeclarations.find(d => d.id === declId)
    if (decl) {
      setPreviewDecl(decl)
    }
  }, [selectedIds, generateDeclaration])

  const handleConfirmDeclaration = useCallback(() => {
    if (!previewDecl) return
    confirmDeclaration(previewDecl.id)
    setToast(`已确认申报${previewDecl.records.length}条记录，税额合计${previewDecl.totalTax.toLocaleString()}元`)
    setPreviewDecl(null)
    setSelectedIds(new Set())
  }, [previewDecl, confirmDeclaration])

  const totalTax = useMemo(() => taxRecords.reduce((s, r) => s + r.taxAmount, 0), [taxRecords])
  const paidTotal = useMemo(() => taxRecords.filter(r => r.status === 'paid').reduce((s, r) => s + r.taxAmount, 0), [taxRecords])
  const declaredCount = useMemo(() => new Set(taxRecords.filter(r => r.status === 'declared' || r.status === 'paid').map(r => r.enterpriseName)).size, [taxRecords])
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

  const previewRecords = useMemo(() => {
    if (!previewDecl) return []
    return taxRecords.filter(r => previewDecl.records.includes(r.id))
  }, [previewDecl, taxRecords])

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg bg-accent-green-dim text-accent-green text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {previewDecl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto glass-card p-6 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-text-primary">申报预览</h3>
              <button onClick={() => setPreviewDecl(null)} className="text-txt-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="px-3 py-2 rounded bg-accent-green-dim">
                  <span className="text-[10px] text-txt-muted block">申报税额合计</span>
                  <span className="stat-value text-sm text-accent-green">{previewDecl.totalTax.toLocaleString()}元</span>
                </div>
                <div className="px-3 py-2 rounded bg-accent-cyan-dim">
                  <span className="text-[10px] text-txt-muted block">申报企业数</span>
                  <span className="stat-value text-sm text-accent-cyan">{previewDecl.enterpriseSummary.length}家</span>
                </div>
                <div className="px-3 py-2 rounded bg-accent-blue-dim">
                  <span className="text-[10px] text-txt-muted block">申报记录数</span>
                  <span className="stat-value text-sm text-accent-blue">{previewDecl.records.length}条</span>
                </div>
                <div className="px-3 py-2 rounded bg-accent-orange-dim">
                  <span className="text-[10px] text-txt-muted block">申报期间</span>
                  <span className="stat-value text-sm text-accent-orange">{previewDecl.period}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-medium text-text-primary mb-2">企业明细</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 px-2 text-txt-secondary font-medium">企业名称</th>
                      <th className="text-right py-2 px-2 text-txt-secondary font-medium">污染物项数</th>
                      <th className="text-right py-2 px-2 text-txt-secondary font-medium">应纳税额</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewDecl.enterpriseSummary.map(e => (
                      <tr key={e.name} className="border-b border-[var(--border)]/50">
                        <td className="py-2 px-2 text-text-primary">{e.name}</td>
                        <td className="py-2 px-2 text-right text-txt-secondary">{e.pollutantCount}项</td>
                        <td className="py-2 px-2 text-right stat-value text-accent-green">{e.totalTax.toLocaleString()}元</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h4 className="text-xs font-medium text-text-primary mb-2">污染物明细</h4>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left py-2 px-2 text-txt-secondary font-medium">企业</th>
                      <th className="text-left py-2 px-2 text-txt-secondary font-medium">污染物</th>
                      <th className="text-right py-2 px-2 text-txt-secondary font-medium">排放量(kg)</th>
                      <th className="text-right py-2 px-2 text-txt-secondary font-medium">当量值</th>
                      <th className="text-right py-2 px-2 text-txt-secondary font-medium">税额(元)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRecords.map(r => (
                      <tr key={r.id} className="border-b border-[var(--border)]/50">
                        <td className="py-2 px-2 text-text-primary">{r.enterpriseName}</td>
                        <td className="py-2 px-2 text-text-primary">{r.pollutantType}</td>
                        <td className="py-2 px-2 text-right stat-value text-text-primary">{r.emission.toLocaleString()}</td>
                        <td className="py-2 px-2 text-right text-txt-secondary">{r.equivalentValue}</td>
                        <td className="py-2 px-2 text-right stat-value text-accent-green">{r.taxAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
                <button
                  onClick={() => setPreviewDecl(null)}
                  className="px-4 py-2 rounded text-xs font-medium bg-[var(--bg-secondary)] border border-[var(--border)] text-txt-secondary hover:text-text-primary transition-colors"
                >取消</button>
                <button
                  onClick={handleConfirmDeclaration}
                  className="px-4 py-2 rounded text-xs font-medium bg-accent-green text-white hover:bg-accent-green/90 transition-colors"
                >确认申报</button>
              </div>
            </div>
          </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGeneratePreview}
                  className="px-4 py-1.5 rounded-md text-xs font-medium bg-accent-green text-white hover:bg-accent-green/90 transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />生成申报表
                </button>
              </div>
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

      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 border-l-[3px] border-accent-purple pl-3">
            <History className="w-4 h-4 text-accent-purple" />
            <span className="text-sm font-semibold text-text-primary">申报记录</span>
            <span className="text-[10px] text-txt-muted">({taxDeclarations.filter(d => d.status === 'confirmed').length} 批已确认)</span>
          </div>
        </div>
        {taxDeclarations.length === 0 ? (
          <div className="py-10 text-center">
            <History className="w-10 h-10 text-txt-muted mx-auto mb-2 opacity-30" />
            <p className="text-[11px] text-txt-muted">暂无申报记录，请先在上方核算明细表选择记录并生成申报表</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {taxDeclarations.slice().reverse().map(decl => {
              const isExpanded = expandedDeclIds.has(decl.id)
              const declRecords = taxRecords.filter(r => decl.records.includes(r.id))
              return (
                <div key={decl.id} className="rounded border border-[var(--border)] overflow-hidden">
                  <button
                    onClick={() => setExpandedDeclIds(prev => {
                      const next = new Set(prev)
                      if (next.has(decl.id)) next.delete(decl.id)
                      else next.add(decl.id)
                      return next
                    })}
                    className="w-full flex items-center justify-between p-3 hover:bg-[var(--bg-secondary)]/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                        decl.status === 'confirmed' ? 'bg-accent-green-dim' : 'bg-accent-yellow-dim'
                      }`}>
                        {decl.status === 'confirmed'
                          ? <CheckCircle className="w-4 h-4 text-accent-green" />
                          : <Eye className="w-4 h-4 text-accent-yellow" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-text-primary font-mono font-medium">{decl.id}</span>
                          <StatusBadge variant={decl.status === 'confirmed' ? 'declared' : 'calculated'} size="sm" />
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-txt-muted">
                          <span>创建 {decl.createdAt}</span>
                          {decl.confirmedAt && <span>确认 {decl.confirmedAt}</span>}
                          <span>申报期 {decl.period}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden md:grid grid-cols-3 gap-4 text-right text-[11px]">
                        <div>
                          <span className="text-txt-muted block text-[9px]">企业数</span>
                          <span className="stat-value text-text-primary">{decl.enterpriseSummary.length}</span>
                        </div>
                        <div>
                          <span className="text-txt-muted block text-[9px]">记录数</span>
                          <span className="stat-value text-text-primary">{decl.records.length}</span>
                        </div>
                        <div>
                          <span className="text-txt-muted block text-[9px]">税额合计</span>
                          <span className="stat-value text-accent-green font-semibold">{decl.totalTax.toLocaleString()}元</span>
                        </div>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-txt-muted" />
                        : <ChevronDown className="w-4 h-4 text-txt-muted" />}
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="border-t border-[var(--border)] p-3 bg-[var(--bg-secondary)]/30 space-y-3">
                      <div>
                        <span className="text-[10px] text-txt-secondary block mb-1.5 font-medium">企业明细</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                          {decl.enterpriseSummary.map(e => (
                            <div key={e.name} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[var(--bg-card)] text-[11px]">
                              <span className="text-text-primary truncate">{e.name}</span>
                              <span className="stat-value text-accent-green font-medium shrink-0 ml-2">{e.totalTax.toLocaleString()}元</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-txt-secondary block mb-1.5 font-medium">污染物明细</span>
                        <div className="overflow-x-auto">
                          <table className="w-full text-[11px]">
                            <thead>
                              <tr className="border-b border-[var(--border)]/70">
                                <th className="text-left py-1.5 px-2 text-txt-secondary font-medium">企业</th>
                                <th className="text-left py-1.5 px-2 text-txt-secondary font-medium">污染物</th>
                                <th className="text-right py-1.5 px-2 text-txt-secondary font-medium">排放量(kg)</th>
                                <th className="text-right py-1.5 px-2 text-txt-secondary font-medium">税额(元)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {declRecords.map(r => (
                                <tr key={r.id} className="border-b border-[var(--border)]/30">
                                  <td className="py-1.5 px-2 text-text-primary">{r.enterpriseName}</td>
                                  <td className="py-1.5 px-2 text-text-primary">{r.pollutantType}</td>
                                  <td className="py-1.5 px-2 text-right stat-value">{r.emission.toLocaleString()}</td>
                                  <td className="py-1.5 px-2 text-right stat-value text-accent-green">{r.taxAmount.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
