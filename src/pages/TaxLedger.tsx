import { useMemo, useState, useEffect, useCallback } from 'react'
import { useStore } from '@/store'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'

const axisColor = '#8896ab'
const splitColor = '#2a3548'

type PeriodTab = '月度' | '季度' | '年度'

interface LedgerRow {
  pollutant: string
  monthEmission: number
  dailyAvg: number
  permitLimit: number
  complianceRate: number
  exceedCount: number
}

interface EnterpriseLedger {
  name: string
  rows: LedgerRow[]
}

const mockLedger: EnterpriseLedger[] = [
  {
    name: '华泰化工有限公司',
    rows: [
      { pollutant: 'COD', monthEmission: 2450, dailyAvg: 81.7, permitLimit: 80, complianceRate: 93.5, exceedCount: 2 },
      { pollutant: 'NH₃N', monthEmission: 320, dailyAvg: 10.7, permitLimit: 8, complianceRate: 86.7, exceedCount: 4 },
      { pollutant: 'SO₂', monthEmission: 1800, dailyAvg: 60.0, permitLimit: 50, complianceRate: 90.0, exceedCount: 3 },
      { pollutant: 'VOCs', monthEmission: 480, dailyAvg: 16.0, permitLimit: 20, complianceRate: 96.7, exceedCount: 1 },
    ],
  },
  {
    name: '鑫源印染集团',
    rows: [
      { pollutant: 'COD', monthEmission: 3200, dailyAvg: 106.7, permitLimit: 100, complianceRate: 90.0, exceedCount: 3 },
      { pollutant: 'NH₃N', monthEmission: 450, dailyAvg: 15.0, permitLimit: 10, complianceRate: 83.3, exceedCount: 5 },
      { pollutant: 'TP', monthEmission: 42, dailyAvg: 1.4, permitLimit: 1.5, complianceRate: 96.7, exceedCount: 1 },
    ],
  },
  {
    name: '恒通钢铁厂',
    rows: [
      { pollutant: 'SO₂', monthEmission: 8500, dailyAvg: 283.3, permitLimit: 100, complianceRate: 76.7, exceedCount: 7 },
      { pollutant: 'NOx', monthEmission: 12000, dailyAvg: 400.0, permitLimit: 150, complianceRate: 70.0, exceedCount: 9 },
      { pollutant: '烟尘', monthEmission: 680, dailyAvg: 22.7, permitLimit: 30, complianceRate: 93.3, exceedCount: 2 },
    ],
  },
]

export default function TaxLedger() {
  const { taxRecords, taxDeclarations, generateDeclaration, confirmDeclaration } = useStore()
  const [period, setPeriod] = useState<PeriodTab>('月度')
  const [toast, setToast] = useState<string | null>(null)
  const [selectedEnterprise, setSelectedEnterprise] = useState<string>('all')
  const [expandedDecls, setExpandedDecls] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  const handleGenerate = useCallback(() => {
    const calculatedIds = taxRecords.filter(r => r.status === 'calculated').map(r => r.id)
    if (calculatedIds.length === 0) {
      setToast('暂无待申报记录')
      return
    }
    generateDeclaration(calculatedIds)
    setToast('申报表已生成，请在税额明细页确认申报')
  }, [taxRecords, generateDeclaration])

  const trendOption = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#2a3548', textStyle: { color: '#e8edf5' } },
      legend: { data: ['COD', 'SO₂', 'NOx'], textStyle: { color: axisColor, fontSize: 10 }, top: 0, right: 0, itemWidth: 14, itemHeight: 3 },
      grid: { top: 36, right: 16, bottom: 24, left: 48 },
      xAxis: { type: 'category', data: months, axisLine: { lineStyle: { color: splitColor } }, axisLabel: { color: axisColor, fontSize: 10 }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitColor, type: 'dashed' } } },
      series: [
        { name: 'COD', type: 'line', data: [11200, 12800, 11500, 13200, 12450, 11800], smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#00d4aa' }, itemStyle: { color: '#00d4aa' } },
        { name: 'SO₂', type: 'line', data: [7800, 8200, 7500, 9100, 8560, 7900], smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#fbbf24' }, itemStyle: { color: '#fbbf24' } },
        { name: 'NOx', type: 'line', data: [10500, 11200, 9800, 13000, 12300, 10800], smooth: true, symbol: 'circle', symbolSize: 4, lineStyle: { width: 2, color: '#3b82f6' }, itemStyle: { color: '#3b82f6' } },
      ],
    }
  }, [])

  const declaredTotal = useMemo(() => taxRecords.filter(r => r.status === 'declared' || r.status === 'paid').reduce((s, r) => s + r.taxAmount, 0), [taxRecords])
  const calculatedTotal = useMemo(() => taxRecords.filter(r => r.status === 'calculated').reduce((s, r) => s + r.taxAmount, 0), [taxRecords])
  const enterpriseCount = useMemo(() => new Set(taxRecords.map(r => r.enterpriseName)).size, [taxRecords])
  const calculatedCount = useMemo(() => taxRecords.filter(r => r.status === 'calculated').length, [taxRecords])

  const enterpriseNames = useMemo(() => Array.from(new Set(taxRecords.map(r => r.enterpriseName))), [taxRecords])

  const filteredDeclarations = useMemo(() => {
    const confirmed = taxDeclarations.filter(d => d.status === 'confirmed')
    if (selectedEnterprise === 'all') return confirmed
    return confirmed.filter(d =>
      d.enterpriseSummary.some(e => e.name === selectedEnterprise)
    )
  }, [taxDeclarations, selectedEnterprise])

  const getDeclRecords = useCallback((declId: string) => {
    const decl = taxDeclarations.find(d => d.id === declId)
    if (!decl) return []
    let records = taxRecords.filter(r => decl.records.includes(r.id))
    if (selectedEnterprise !== 'all') {
      records = records.filter(r => r.enterpriseName === selectedEnterprise)
    }
    return records
  }, [taxDeclarations, taxRecords, selectedEnterprise])

  const tabs: PeriodTab[] = ['月度', '季度', '年度']

  return (
    <div className="space-y-5">
      {toast && (
        <div className={cn(
          'fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg animate-fade-in',
          calculatedCount > 0 || toast.includes('暂无') ? 'bg-accent-orange-dim text-accent-orange' : 'bg-accent-green-dim text-accent-green'
        )}>
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-md bg-[var(--bg-card)] w-fit">
          {tabs.map(t => (
            <button key={t} onClick={() => setPeriod(t)} className={cn('px-4 py-1.5 rounded text-xs font-medium transition-colors', period === t ? 'bg-accent-green-dim text-accent-green' : 'text-txt-secondary hover:text-text-primary')}>
              {t}
            </button>
          ))}
        </div>
        <select
          value={selectedEnterprise}
          onChange={e => setSelectedEnterprise(e.target.value)}
          className="px-3 py-1.5 rounded text-xs bg-[var(--bg-card)] border border-[var(--border)] text-text-primary focus:outline-none focus:border-accent-green"
        >
          <option value="all">全部企业</option>
          {enterpriseNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {mockLedger
            .filter(ent => selectedEnterprise === 'all' || ent.name === selectedEnterprise)
            .map(enterprise => (
            <div key={enterprise.name} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3 border-l-[3px] border-accent-green pl-3">
                <span className="text-sm font-semibold text-text-primary">{enterprise.name}</span>
                <span className="text-[10px] text-txt-muted px-2 py-0.5 rounded bg-[var(--bg-secondary)]">{period}台账</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 px-2 text-txt-secondary font-medium">污染物</th>
                    <th className="text-right py-2 px-2 text-txt-secondary font-medium">月排放量</th>
                    <th className="text-right py-2 px-2 text-txt-secondary font-medium">日均排放量</th>
                    <th className="text-right py-2 px-2 text-txt-secondary font-medium">许可限值</th>
                    <th className="text-right py-2 px-2 text-txt-secondary font-medium">达标率</th>
                    <th className="text-center py-2 px-2 text-txt-secondary font-medium">超标次数</th>
                  </tr>
                </thead>
                <tbody>
                  {enterprise.rows.map(row => (
                    <tr key={row.pollutant} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="py-2 px-2 text-text-primary font-medium">{row.pollutant}</td>
                      <td className="py-2 px-2 text-right stat-value text-text-primary">{row.monthEmission.toLocaleString()}</td>
                      <td className="py-2 px-2 text-right text-txt-secondary">{row.dailyAvg}</td>
                      <td className="py-2 px-2 text-right text-txt-secondary">{row.permitLimit}</td>
                      <td className={cn('py-2 px-2 text-right stat-value', row.complianceRate >= 90 ? 'text-accent-green' : row.complianceRate >= 80 ? 'text-accent-yellow' : 'text-accent-red')}>
                        {row.complianceRate}%
                      </td>
                      <td className="py-2 px-2 text-center">
                        {row.exceedCount > 0 ? (
                          <span className="text-accent-red stat-value">{row.exceedCount}</span>
                        ) : (
                          <span className="text-txt-muted">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-cyan pl-3">
              <span className="text-sm font-semibold text-text-primary">月度排放趋势</span>
            </div>
            <ReactECharts option={trendOption} style={{ height: 260 }} />
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3 border-l-[3px] border-accent-blue pl-3">
              <span className="text-sm font-semibold text-text-primary">申报表预览</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[var(--border)]/50">
                <span className="text-txt-secondary">申报税额合计</span>
                <span className="stat-value text-accent-green">{declaredTotal.toLocaleString()}元</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--border)]/50">
                <span className="text-txt-secondary">待核算税额</span>
                <span className="stat-value text-accent-orange">{calculatedTotal.toLocaleString()}元</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--border)]/50">
                <span className="text-txt-secondary">申报企业数</span>
                <span className="stat-value text-text-primary">{enterpriseCount}家</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-txt-secondary">申报期间</span>
                <span className="text-text-primary">2026年5月</span>
              </div>
            </div>
            <button
              onClick={handleGenerate}
              className="w-full mt-3 py-2 rounded text-xs font-medium bg-accent-green-dim text-accent-green hover:bg-accent-green/20 transition-colors"
            >
              生成申报表
            </button>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3 border-l-[3px] border-accent-green pl-3">
              <FileText className="w-4 h-4 text-accent-green" />
              <span className="text-sm font-semibold text-text-primary">申报批次记录</span>
              <span className="text-[10px] text-txt-muted">({selectedEnterprise === 'all' ? '全部企业' : selectedEnterprise})</span>
            </div>
            {filteredDeclarations.length > 0 ? (
              <div className="space-y-2">
                {filteredDeclarations.slice().reverse().map(decl => {
                  const isExpanded = expandedDecls.has(decl.id)
                  const records = getDeclRecords(decl.id)
                  const entSummary = selectedEnterprise === 'all'
                    ? decl.enterpriseSummary
                    : decl.enterpriseSummary.filter(e => e.name === selectedEnterprise)
                  return (
                    <div key={decl.id} className="rounded border border-[var(--border)] overflow-hidden">
                      <button
                        onClick={() => setExpandedDecls(prev => {
                          const next = new Set(prev)
                          if (next.has(decl.id)) next.delete(decl.id)
                          else next.add(decl.id)
                          return next
                        })}
                        className="w-full flex items-center justify-between p-2.5 hover:bg-[var(--bg-secondary)]/50 transition-colors text-left"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-text-primary font-mono font-medium">{decl.id}</span>
                            <StatusBadge variant="declared" size="sm" />
                          </div>
                          <span className="text-[9px] text-txt-muted font-mono block mt-0.5">{decl.confirmedAt || decl.createdAt}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="stat-value text-[11px] text-accent-green font-semibold">{decl.totalTax.toLocaleString()}元</span>
                          {isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5 text-txt-muted" />
                            : <ChevronDown className="w-3.5 h-3.5 text-txt-muted" />}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="border-t border-[var(--border)] p-2 bg-[var(--bg-secondary)]/30 space-y-2">
                          <div className="text-[10px] text-txt-muted">
                            包含企业 <span className="text-text-primary font-medium">{entSummary.length}家</span>
                            ，污染物 <span className="text-text-primary font-medium">{records.length}项</span>
                          </div>
                          {records.map(r => (
                            <div key={r.id} className="flex items-center justify-between py-1 px-2 rounded bg-[var(--bg-card)] text-[11px]">
                              <div className="min-w-0">
                                <span className="text-text-primary">{r.pollutantType}</span>
                                {selectedEnterprise === 'all' && (
                                  <span className="text-txt-muted ml-1.5">· {r.enterpriseName.slice(0, 4)}</span>
                                )}
                                <span className="text-txt-muted ml-1.5">{r.period}</span>
                              </div>
                              <span className="stat-value text-accent-green shrink-0 ml-2">{r.taxAmount.toLocaleString()}元</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-txt-muted py-4 text-center">暂无已确认申报记录</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
