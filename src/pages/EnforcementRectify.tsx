import { useMemo } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'
import { ClipboardCheck, Wrench, CheckCircle2, Percent, Upload, CheckCircle, XCircle } from 'lucide-react'

const axisColor = '#8896ab'
const splitColor = '#2a3548'

interface RectItem {
  id: string
  enterpriseName: string
  violation: string
  requirement: string
  deadline: string
  currentStep: number
  steps: { label: string; done: boolean }[]
}

const mockRectItems: RectItem[] = [
  {
    id: 'r1', enterpriseName: '华泰化工有限公司',
    violation: 'COD排放浓度持续超标，小时均值达98.5mg/L，超限值23.1%',
    requirement: '立即排查超标原因，加强治污设施运维，确保达标排放',
    deadline: '2026-07-05', currentStep: 1,
    steps: [
      { label: '下达整改', done: true },
      { label: '企业反馈', done: false },
      { label: '执法复核', done: false },
      { label: '销号确认', done: false },
    ],
  },
  {
    id: 'r2', enterpriseName: '绿洲纸业有限公司',
    violation: 'COD日均值112.3mg/L，超标24.8%；治污设施加药泵停运',
    requirement: '修复加药泵，恢复治污设施正常运行，提交整改报告',
    deadline: '2026-07-01', currentStep: 2,
    steps: [
      { label: '下达整改', done: true },
      { label: '企业反馈', done: true },
      { label: '执法复核', done: false },
      { label: '销号确认', done: false },
    ],
  },
  {
    id: 'r3', enterpriseName: '永利建材有限公司',
    violation: '烟尘浓度超标，小时均值28.5mg/m³，超限值42.5%',
    requirement: '检查除尘设施运行状态，清理滤袋，确保排放达标',
    deadline: '2026-06-28', currentStep: 0,
    steps: [
      { label: '下达整改', done: false },
      { label: '企业反馈', done: false },
      { label: '执法复核', done: false },
      { label: '销号确认', done: false },
    ],
  },
  {
    id: 'r4', enterpriseName: '恒通钢铁厂',
    violation: 'SO₂数据疑似造假，长时间恒定在5mg/m³',
    requirement: '提交数据采集系统检测报告，配合执法检查',
    deadline: '2026-06-25', currentStep: 3,
    steps: [
      { label: '下达整改', done: true },
      { label: '企业反馈', done: true },
      { label: '执法复核', done: true },
      { label: '销号确认', done: false },
    ],
  },
  {
    id: 'r5', enterpriseName: '鑫源印染集团',
    violation: '治污设施停运，加药泵停机2小时',
    requirement: '完善设施运维管理，建立故障应急响应机制',
    deadline: '2026-06-30', currentStep: 4,
    steps: [
      { label: '下达整改', done: true },
      { label: '企业反馈', done: true },
      { label: '执法复核', done: true },
      { label: '销号确认', done: true },
    ],
  },
]

const completedItems = mockRectItems.filter(r => r.currentStep === 4)
const inProgressItems = mockRectItems.filter(r => r.currentStep > 0 && r.currentStep < 4)
const pendingItems = mockRectItems.filter(r => r.currentStep === 0)
const closeRate = mockRectItems.length > 0 ? ((completedItems.length / mockRectItems.length) * 100).toFixed(1) : '0'

export default function EnforcementRectify() {
  const chartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#2a3548', textStyle: { color: '#e8edf5' } },
    grid: { top: 16, right: 16, bottom: 24, left: 48 },
    xAxis: { type: 'category', data: ['1月', '2月', '3月', '4月', '5月', '6月'], axisLine: { lineStyle: { color: splitColor } }, axisLabel: { color: axisColor, fontSize: 10 }, axisTick: { show: false } },
    yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitColor, type: 'dashed' } } },
    series: [
      { name: '下达', type: 'bar', stack: 'total', data: [5, 3, 6, 4, 7, 3], itemStyle: { color: '#ff6b35', borderRadius: [0, 0, 0, 0] }, barWidth: 20 },
      { name: '整改中', type: 'bar', stack: 'total', data: [2, 1, 3, 2, 1, 1], itemStyle: { color: '#3b82f6' }, barWidth: 20 },
      { name: '已销号', type: 'bar', stack: 'total', data: [4, 3, 4, 5, 6, 2], itemStyle: { color: '#00d4aa', borderRadius: [4, 4, 0, 0] }, barWidth: 20 },
    ],
  }), [])

  const getStepStyle = (done: boolean, isCurrent: boolean) => {
    if (done) return 'bg-accent-green border-accent-green text-white'
    if (isCurrent) return 'bg-accent-blue border-accent-blue text-white animate-pulse'
    return 'bg-[var(--bg-secondary)] border-[var(--border)] text-txt-muted'
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="待整改" value={pendingItems.length} icon={<ClipboardCheck className="w-4 h-4 text-accent-orange" />} color="orange" pulse />
        <StatCard label="整改中" value={inProgressItems.length} icon={<Wrench className="w-4 h-4 text-accent-blue" />} color="blue" />
        <StatCard label="已完成" value={completedItems.length} icon={<CheckCircle2 className="w-4 h-4 text-accent-green" />} color="green" />
        <StatCard label="销号率" value={closeRate} unit="%" icon={<Percent className="w-4 h-4 text-accent-cyan" />} color="cyan" />
      </div>

      <div className="space-y-4">
        {mockRectItems.map(item => (
          <div key={item.id} className="glass-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-1">{item.enterpriseName}</h3>
                <p className="text-xs text-accent-red">{item.violation}</p>
              </div>
              <span className={cn('text-[11px] px-2 py-0.5 rounded font-medium shrink-0', item.currentStep === 0 ? 'bg-accent-orange-dim text-accent-orange' : item.currentStep === 4 ? 'bg-accent-green-dim text-accent-green' : 'bg-accent-blue-dim text-accent-blue')}>
                {item.currentStep === 0 ? '待整改' : item.currentStep === 4 ? '已销号' : '整改中'}
              </span>
            </div>

            <div className="text-xs text-txt-secondary mb-4">
              <span className="text-txt-muted">整改要求：</span>{item.requirement}
              <span className="ml-4 text-txt-muted">截止日期：</span>
              <span className={cn(new Date(item.deadline) < new Date() && item.currentStep < 4 ? 'text-accent-red font-medium' : 'text-text-primary')}>
                {item.deadline}
              </span>
            </div>

            <div className="flex items-center gap-0 mb-4">
              {item.steps.map((step, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-medium transition-all', getStepStyle(step.done, i === item.currentStep))}>
                      {step.done ? '✓' : i + 1}
                    </div>
                    <span className={cn('text-[10px] mt-1 whitespace-nowrap', step.done ? 'text-accent-green' : i === item.currentStep ? 'text-accent-blue' : 'text-txt-muted')}>
                      {step.label}
                    </span>
                  </div>
                  {i < item.steps.length - 1 && (
                    <div className={cn('h-0.5 flex-1 -mt-4', step.done ? 'bg-accent-green' : 'bg-[var(--border)]')} />
                  )}
                </div>
              ))}
            </div>

            {item.currentStep > 0 && item.currentStep < 4 && (
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]/50">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-cyan-dim text-accent-cyan hover:bg-accent-cyan/20 transition-colors flex items-center gap-1">
                    <Upload className="w-3 h-3" />上传整改材料
                  </button>
                </div>
                {item.currentStep === 2 && (
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-green-dim text-accent-green hover:bg-accent-green/20 transition-colors flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />通过复核
                    </button>
                    <button className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-red-dim text-accent-red hover:bg-accent-red/20 transition-colors flex items-center gap-1">
                      <XCircle className="w-3 h-3" />驳回整改
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-green pl-3">
          <span className="text-sm font-semibold text-text-primary">整改统计</span>
        </div>
        <ReactECharts option={chartOption} style={{ height: 220 }} />
      </div>
    </div>
  )
}
