import { useMemo } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'

const axisLabelColor = '#8896ab'
const splitLineColor = '#2a3548'

interface ChartConfig {
  key: 'cod' | 'nh3n' | 'tp' | 'tn'
  name: string
  color: string
  limit: number
}

const chartConfigs: ChartConfig[] = [
  { key: 'cod', name: 'COD', color: '#00d4aa', limit: 80 },
  { key: 'nh3n', name: 'NH₃-N', color: '#3b82f6', limit: 8 },
  { key: 'tp', name: 'TP', color: '#fbbf24', limit: 1.0 },
  { key: 'tn', name: 'TN', color: '#a855f7', limit: 15 },
]

function buildChartOption(config: ChartConfig, data: [string, number][]) {
  const hours = data.map(([, ,], i) => {
    const d = new Date(data[i][0])
    return `${d.getHours()}:00`
  })
  const values = data.map(([, v]) => v)
  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a2332',
      borderColor: '#2a3548',
      textStyle: { color: '#e8edf5', fontSize: 11 },
    },
    grid: { top: 32, right: 16, bottom: 24, left: 48 },
    title: {
      text: `${config.name} 24h趋势`,
      textStyle: { color: '#e8edf5', fontSize: 13, fontWeight: 500 },
      left: 0,
      top: 0,
    },
    xAxis: {
      type: 'category',
      data: hours,
      axisLine: { lineStyle: { color: splitLineColor } },
      axisLabel: { color: axisLabelColor, fontSize: 10, interval: 3 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: axisLabelColor, fontSize: 10 },
      splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } },
    },
    series: [
      {
        name: config.name,
        type: 'line',
        data: values,
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: config.color },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: config.color.replace(')', ',0.25)').replace('rgb', 'rgba') || `${config.color}40` },
              { offset: 1, color: 'transparent' },
            ],
          },
        },
      },
      {
        name: '限值',
        type: 'line',
        data: Array(hours.length).fill(config.limit),
        lineStyle: { width: 1, color: '#ff3b5c', type: 'dashed' },
        symbol: 'none',
      },
    ],
  }
}

const mockTableData = [
  { time: '09:00', cod: 65.3, nh3n: 6.2, tp: 0.85, tn: 11.5, ph: 7.2, flow: 125, flag: 'valid' },
  { time: '08:00', cod: 72.1, nh3n: 5.8, tp: 0.92, tn: 10.8, ph: 7.1, flow: 118, flag: 'valid' },
  { time: '07:00', cod: 58.7, nh3n: 7.1, tp: 0.78, tn: 12.3, ph: 7.3, flow: 130, flag: 'valid' },
  { time: '06:00', cod: 89.5, nh3n: 8.3, tp: 1.12, tn: 14.2, ph: 6.9, flow: 142, flag: 'suspect' },
  { time: '05:00', cod: 63.4, nh3n: 5.5, tp: 0.73, tn: 10.1, ph: 7.0, flow: 115, flag: 'valid' },
  { time: '04:00', cod: 55.2, nh3n: 4.9, tp: 0.65, tn: 9.8, ph: 7.4, flow: 108, flag: 'valid' },
]

const flagLabels: Record<string, string> = {
  valid: '有效',
  suspect: '可疑',
  invalid: '无效',
}

export default function MonitorWater() {
  const { chartData } = useStore()

  const chartOptions = useMemo(() => {
    return chartConfigs.map((cfg) => buildChartOption(cfg, chartData[cfg.key]))
  }, [chartData])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="COD" value="65.3" unit="mg/L" color="green" />
        <StatCard label="NH₃-N" value="6.2" unit="mg/L" color="blue" />
        <StatCard label="TP" value="0.85" unit="mg/L" color="yellow" />
        <StatCard label="TN" value="11.5" unit="mg/L" color="cyan" />
        <StatCard label="pH" value="7.2" color="green" />
        <StatCard label="流量" value="125" unit="m³/h" color="blue" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartOptions.map((opt, i) => (
          <div key={chartConfigs[i].key} className="glass-card p-4">
            <ReactECharts option={opt} style={{ height: 240 }} />
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-green pl-3">
          <span className="text-sm font-semibold text-text-primary">近期监测数据</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-txt-muted border-b border-border">
                <th className="text-left py-2 px-3 font-medium">时间</th>
                <th className="text-right py-2 px-3 font-medium">COD(mg/L)</th>
                <th className="text-right py-2 px-3 font-medium">NH₃-N(mg/L)</th>
                <th className="text-right py-2 px-3 font-medium">TP(mg/L)</th>
                <th className="text-right py-2 px-3 font-medium">TN(mg/L)</th>
                <th className="text-right py-2 px-3 font-medium">pH</th>
                <th className="text-right py-2 px-3 font-medium">流量(m³/h)</th>
                <th className="text-center py-2 px-3 font-medium">质控标记</th>
              </tr>
            </thead>
            <tbody>
              {mockTableData.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-bg-card-hover transition-colors">
                  <td className="py-2 px-3 text-txt-secondary font-mono">{row.time}</td>
                  <td className={cn('py-2 px-3 text-right font-mono stat-value', row.cod > 80 && 'text-accent-red')}>
                    {row.cod}
                  </td>
                  <td className={cn('py-2 px-3 text-right font-mono stat-value', row.nh3n > 8 && 'text-accent-red')}>
                    {row.nh3n}
                  </td>
                  <td className={cn('py-2 px-3 text-right font-mono stat-value', row.tp > 1.0 && 'text-accent-red')}>
                    {row.tp}
                  </td>
                  <td className={cn('py-2 px-3 text-right font-mono stat-value', row.tn > 15 && 'text-accent-red')}>
                    {row.tn}
                  </td>
                  <td className="py-2 px-3 text-right font-mono stat-value">{row.ph}</td>
                  <td className="py-2 px-3 text-right font-mono stat-value">{row.flow}</td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-0.5 rounded text-[10px]',
                        row.flag === 'valid' && 'bg-accent-green-dim text-accent-green',
                        row.flag === 'suspect' && 'bg-accent-orange-dim text-accent-orange',
                        row.flag === 'invalid' && 'bg-accent-red-dim text-accent-red'
                      )}
                    >
                      {flagLabels[row.flag]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
