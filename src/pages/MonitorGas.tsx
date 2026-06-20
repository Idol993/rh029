import { useMemo } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'

const axisLabelColor = '#8896ab'
const splitLineColor = '#2a3548'

interface ChartConfig {
  key: 'so2' | 'nox' | 'vocs' | 'dust'
  name: string
  color: string
  limit: number
}

const chartConfigs: ChartConfig[] = [
  { key: 'so2', name: 'SO₂', color: '#fbbf24', limit: 50 },
  { key: 'nox', name: 'NOx', color: '#ff6b35', limit: 100 },
  { key: 'vocs', name: 'VOCs', color: '#a855f7', limit: 20 },
  { key: 'dust', name: '烟尘', color: '#06b6d4', limit: 30 },
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
              { offset: 0, color: `${config.color}40` },
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
  { time: '09:00', so2: 42, nox: 78, vocs: 16.5, dust: 19.2, o2: 12.3, temp: 85, flag: 'valid' },
  { time: '08:00', so2: 38, nox: 82, vocs: 14.8, dust: 17.5, o2: 12.1, temp: 83, flag: 'valid' },
  { time: '07:00', so2: 55, nox: 95, vocs: 21.3, dust: 25.8, o2: 11.8, temp: 88, flag: 'suspect' },
  { time: '06:00', so2: 31, nox: 65, vocs: 12.4, dust: 15.6, o2: 12.5, temp: 81, flag: 'valid' },
  { time: '05:00', so2: 28, nox: 60, vocs: 10.2, dust: 13.8, o2: 12.7, temp: 79, flag: 'valid' },
  { time: '04:00', so2: 25, nox: 55, vocs: 9.5, dust: 12.1, o2: 13.0, temp: 77, flag: 'valid' },
]

const flagLabels: Record<string, string> = {
  valid: '有效',
  suspect: '可疑',
  invalid: '无效',
}

export default function MonitorGas() {
  const { chartData } = useStore()

  const chartOptions = useMemo(() => {
    return chartConfigs.map((cfg) => buildChartOption(cfg, chartData[cfg.key]))
  }, [chartData])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="SO₂" value="42" unit="mg/m³" color="yellow" />
        <StatCard label="NOx" value="78" unit="mg/m³" color="orange" />
        <StatCard label="VOCs" value="16.5" unit="mg/m³" color="cyan" />
        <StatCard label="烟尘" value="19.2" unit="mg/m³" color="blue" />
        <StatCard label="O₂" value="12.3" unit="%" color="green" />
        <StatCard label="烟温" value="85" unit="°C" color="orange" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chartOptions.map((opt, i) => (
          <div key={chartConfigs[i].key} className="glass-card p-4">
            <ReactECharts option={opt} style={{ height: 240 }} />
          </div>
        ))}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-orange pl-3">
          <span className="text-sm font-semibold text-text-primary">近期监测数据</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-txt-muted border-b border-border">
                <th className="text-left py-2 px-3 font-medium">时间</th>
                <th className="text-right py-2 px-3 font-medium">SO₂(mg/m³)</th>
                <th className="text-right py-2 px-3 font-medium">NOx(mg/m³)</th>
                <th className="text-right py-2 px-3 font-medium">VOCs(mg/m³)</th>
                <th className="text-right py-2 px-3 font-medium">烟尘(mg/m³)</th>
                <th className="text-right py-2 px-3 font-medium">O₂(%)</th>
                <th className="text-right py-2 px-3 font-medium">烟温(°C)</th>
                <th className="text-center py-2 px-3 font-medium">质控标记</th>
              </tr>
            </thead>
            <tbody>
              {mockTableData.map((row, idx) => (
                <tr key={idx} className="border-b border-border/50 hover:bg-bg-card-hover transition-colors">
                  <td className="py-2 px-3 text-txt-secondary font-mono">{row.time}</td>
                  <td className={cn('py-2 px-3 text-right font-mono stat-value', row.so2 > 50 && 'text-accent-red')}>
                    {row.so2}
                  </td>
                  <td className={cn('py-2 px-3 text-right font-mono stat-value', row.nox > 100 && 'text-accent-red')}>
                    {row.nox}
                  </td>
                  <td className={cn('py-2 px-3 text-right font-mono stat-value', row.vocs > 20 && 'text-accent-red')}>
                    {row.vocs}
                  </td>
                  <td className={cn('py-2 px-3 text-right font-mono stat-value', row.dust > 30 && 'text-accent-red')}>
                    {row.dust}
                  </td>
                  <td className="py-2 px-3 text-right font-mono stat-value">{row.o2}</td>
                  <td className="py-2 px-3 text-right font-mono stat-value">{row.temp}</td>
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
