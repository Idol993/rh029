import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'
import ReactECharts from 'echarts-for-react'
import { ArrowLeft, ExternalLink, Video, FileText, Activity } from 'lucide-react'
import type { WarningEvent } from '@/types'

const axisLabelColor = '#8896ab'
const splitLineColor = '#2a3548'

interface TimelineStep {
  label: string
  time: string
  person: string
  done: boolean
}

function buildTimeline(event: WarningEvent) {
  const steps: TimelineStep[] = [
    { label: '触发', time: event.triggerTime, person: '系统自动', done: true },
  ]
  if (event.status === 'pending') {
    steps.push({ label: '推送', time: event.triggerTime.replace(/\d{2}:\d{2}:\d{2}/, (m) => {
      const [h, mi, s] = m.split(':').map(Number)
      const nh = h + Math.floor((mi + 5) / 60)
      return `${String(nh).padStart(2, '0')}:${String((mi + 5) % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }), person: '系统自动', done: true })
    steps.push({ label: '处置', time: '', person: '', done: false })
    steps.push({ label: '销号', time: '', person: '', done: false })
  } else {
    steps.push({ label: '推送', time: event.triggerTime, person: '系统自动', done: true })
    steps.push({ label: '处置', time: event.triggerTime, person: event.handler || '—', done: event.status !== 'processing' || true })
    steps.push({ label: '销号', time: event.status === 'resolved' || event.status === 'closed' ? event.triggerTime : '', person: event.handler || '—', done: event.status === 'resolved' || event.status === 'closed' })
  }
  return steps
}

export default function WarningDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { warningEvents, enforcementTasks } = useStore()

  const event = warningEvents.find((e) => e.id === id)

  const timeline = useMemo(() => event ? buildTimeline(event) : [], [event])

  const chartOption = useMemo(() => {
    if (!event || event.pollutantName === '-') return null
    const now = new Date(event.triggerTime)
    const hours = Array.from({ length: 24 }, (_, i) => {
      const t = new Date(now.getTime() - (23 - i) * 3600000)
      return `${t.getHours()}:00`
    })
    const baseVal = event.limitValue * 0.7
    const spikeIdx = 20
    const values = hours.map((_, i) => {
      if (i === spikeIdx) return event.exceedValue
      if (i === spikeIdx + 1) return event.limitValue * 0.95
      return Math.round((baseVal + (Math.random() - 0.5) * baseVal * 0.3) * 100) / 100
    })
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#2a3548', textStyle: { color: '#e8edf5' } },
      grid: { top: 32, right: 16, bottom: 24, left: 48 },
      xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: splitLineColor } }, axisLabel: { color: axisLabelColor, fontSize: 10, interval: 3 }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisLabelColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } } },
      series: [
        {
          type: 'line', data: values, smooth: true, symbol: 'none',
          lineStyle: { width: 2, color: '#ff3b5c' },
          areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(255,59,92,0.25)' }, { offset: 1, color: 'rgba(255,59,92,0)' }] } },
          markLine: {
            silent: true,
            data: [{ yAxis: event.limitValue, name: '限值' }],
            lineStyle: { color: '#fbbf24', type: 'dashed', width: 1 },
            label: { formatter: `限值 ${event.limitValue}`, color: '#fbbf24', fontSize: 10 },
          },
        },
      ],
    }
  }, [event])

  if (!event) {
    return (
      <div className="flex items-center justify-center h-96 text-txt-muted">
        未找到该预警事件
      </div>
    )
  }

  const relatedTask = enforcementTasks.find((t) => t.warningId === event.id)

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/warning')}
        className="flex items-center gap-1.5 text-sm text-txt-secondary hover:text-accent-green transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回预警列表
      </button>

      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge variant={event.level} pulse={event.status === 'pending'} />
              <StatusBadge variant={event.status} />
            </div>
            <h2 className="text-lg font-semibold text-text-primary">{event.enterpriseName}</h2>
          </div>
          <span className="text-xs text-txt-muted">{event.outletCode}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-txt-muted text-xs block mb-1">预警类型</span><span className="text-text-primary">{event.typeName}</span></div>
          <div><span className="text-txt-muted text-xs block mb-1">污染物</span><span className="text-text-primary">{event.pollutantName}</span></div>
          {event.pollutantName !== '-' && (
            <>
              <div><span className="text-txt-muted text-xs block mb-1">超标值</span><span className="text-accent-red stat-value">{event.exceedValue}{event.unit}</span></div>
              <div><span className="text-txt-muted text-xs block mb-1">限值</span><span className="text-text-primary">{event.limitValue}{event.unit}</span></div>
            </>
          )}
          <div><span className="text-txt-muted text-xs block mb-1">触发时间</span><span className="text-text-primary">{event.triggerTime}</span></div>
          {event.handler && <div><span className="text-txt-muted text-xs block mb-1">处置人</span><span className="text-text-primary">{event.handler}</span></div>}
        </div>
        <p className="mt-3 text-sm text-txt-secondary">{event.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 border-l-[3px] border-accent-green pl-3">处置时间线</h3>
          <div className="space-y-0">
            {timeline.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-3 h-3 rounded-full border-2 shrink-0 mt-1',
                    step.done ? 'bg-accent-green border-accent-green' : 'bg-transparent border-[#374357]'
                  )} />
                  {i < timeline.length - 1 && <div className={cn('w-0.5 flex-1 min-h-[40px]', step.done ? 'bg-accent-green/30' : 'bg-[#2a3548]')} />}
                </div>
                <div className="pb-5">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-sm font-medium', step.done ? 'text-text-primary' : 'text-txt-muted')}>{step.label}</span>
                  </div>
                  {step.time && <p className="text-xs text-txt-muted mt-0.5">{step.time}</p>}
                  {step.person && <p className="text-xs text-txt-secondary mt-0.5">{step.person}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 border-l-[3px] border-accent-green pl-3">关联监测数据</h3>
          {chartOption ? (
            <ReactECharts option={chartOption} style={{ height: 280 }} />
          ) : (
            <div className="flex items-center justify-center h-64 text-txt-muted text-sm">暂无监测数据</div>
          )}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 border-l-[3px] border-accent-green pl-3">证据链</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-md bg-[#111827] border border-[#2a3548]">
            <FileText className="w-5 h-5 text-accent-blue shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-text-primary font-medium truncate">执法任务</p>
              <p className="text-xs text-txt-muted truncate">{relatedTask ? `${relatedTask.typeName} - ${relatedTask.enforcerName}` : '暂无关联任务'}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-txt-muted shrink-0 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-md bg-[#111827] border border-[#2a3548]">
            <Activity className="w-5 h-5 text-accent-orange shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-text-primary font-medium truncate">监测数据</p>
              <p className="text-xs text-txt-muted truncate">{event.pollutantName !== '-' ? `${event.pollutantName} 超标记录` : '暂无数据'}</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-txt-muted shrink-0 ml-auto" />
          </div>
          <div className="flex items-center gap-3 p-3 rounded-md bg-[#111827] border border-[#2a3548]">
            <Video className="w-5 h-5 text-accent-cyan shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-text-primary font-medium truncate">视频监控</p>
              <p className="text-xs text-txt-muted truncate">{event.outletCode} 排口视频</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-txt-muted shrink-0 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  )
}
