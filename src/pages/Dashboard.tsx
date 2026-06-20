import { useMemo } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import ReactECharts from 'echarts-for-react'
import { Cloud, Wifi, Activity, ShieldCheck, AlertTriangle, Clock } from 'lucide-react'

const axisLabelColor = '#8896ab'
const splitLineColor = '#2a3548'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-green pl-3">
      <span className="text-sm font-semibold text-text-primary">{children}</span>
    </div>
  )
}

export default function Dashboard() {
  const { stats, chartData, warningEvents, enforcementTasks, enterprises } = useStore()

  const trendOption = useMemo(() => {
    const hours = chartData.cod.map(([, v], i) => {
      const d = new Date(chartData.cod[i][0])
      return `${d.getHours()}:00`
    })
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#2a3548', textStyle: { color: '#e8edf5' } },
      legend: { data: ['COD', 'SO₂', 'NOx'], textStyle: { color: axisLabelColor }, top: 0, right: 0, itemWidth: 16, itemHeight: 3 },
      grid: { top: 36, right: 16, bottom: 24, left: 48 },
      xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: splitLineColor } }, axisLabel: { color: axisLabelColor, fontSize: 10, interval: 3 }, axisTick: { show: false } },
      yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisLabelColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } } },
      series: [
        { name: 'COD', type: 'line', data: chartData.cod.map(([, v]) => v), smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#00d4aa' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(0,212,170,0.25)' }, { offset: 1, color: 'rgba(0,212,170,0)' }] } } },
        { name: 'SO₂', type: 'line', data: chartData.so2.map(([, v]) => v), smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#fbbf24' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(251,191,36,0.15)' }, { offset: 1, color: 'rgba(251,191,36,0)' }] } } },
        { name: 'NOx', type: 'line', data: chartData.nox.map(([, v]) => v), smooth: true, symbol: 'none', lineStyle: { width: 2, color: '#3b82f6' }, areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(59,130,246,0.15)' }, { offset: 1, color: 'rgba(59,130,246,0)' }] } } },
      ],
    }
  }, [chartData])

  const gaugeOption = useMemo(() => ({
    backgroundColor: 'transparent',
    series: [{
      type: 'gauge',
      startAngle: 220,
      endAngle: -40,
      radius: '90%',
      center: ['50%', '55%'],
      min: 0,
      max: 100,
      splitNumber: 5,
      axisLine: { lineStyle: { width: 12, color: [[0.6, '#ff3b5c'], [0.8, '#fbbf24'], [1, '#00d4aa']] } },
      pointer: { itemStyle: { color: '#e8edf5' }, width: 4, length: '60%' },
      axisTick: { show: false },
      splitLine: { length: 8, lineStyle: { width: 2, color: '#2a3548' } },
      axisLabel: { distance: 16, color: axisLabelColor, fontSize: 10 },
      detail: { valueAnimation: true, formatter: '{value}%', color: '#00d4aa', fontSize: 22, fontFamily: 'JetBrains Mono', offsetCenter: [0, '70%'] },
      title: { show: true, offsetCenter: [0, '90%'], color: axisLabelColor, fontSize: 12 },
      data: [{ value: stats.onlineRate, name: '设备在线率' }],
    }],
  }), [stats.onlineRate])

  const warningDistOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#2a3548', textStyle: { color: '#e8edf5' } },
    grid: { top: 16, right: 16, bottom: 24, left: 48 },
    xAxis: { type: 'category', data: ['红色预警', '橙色预警', '黄色预警'], axisLine: { lineStyle: { color: splitLineColor } }, axisLabel: { color: axisLabelColor, fontSize: 11 }, axisTick: { show: false } },
    yAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisLabelColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } } },
    series: [{
      type: 'bar',
      data: [
        { value: stats.redWarnings, itemStyle: { color: '#ff3b5c', borderRadius: [4, 4, 0, 0] } },
        { value: stats.orangeWarnings, itemStyle: { color: '#ff6b35', borderRadius: [4, 4, 0, 0] } },
        { value: stats.yellowWarnings, itemStyle: { color: '#fbbf24', borderRadius: [4, 4, 0, 0] } },
      ],
      barWidth: 32,
    }],
  }), [stats])

  const enterpriseRankOption = useMemo(() => {
    const sorted = [...enterprises].sort(() => 0.5 - Math.random()).slice(0, 5)
    const values = [2450, 3200, 1890, 1560, 1230]
    const names = sorted.map(e => e.name.length > 6 ? e.name.slice(0, 6) + '…' : e.name)
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', backgroundColor: '#1a2332', borderColor: '#2a3548', textStyle: { color: '#e8edf5' } },
      grid: { top: 8, right: 48, bottom: 8, left: 80 },
      xAxis: { type: 'value', axisLine: { show: false }, axisLabel: { color: axisLabelColor, fontSize: 10 }, splitLine: { lineStyle: { color: splitLineColor, type: 'dashed' } } },
      yAxis: { type: 'category', data: names, axisLine: { show: false }, axisLabel: { color: axisLabelColor, fontSize: 11 }, axisTick: { show: false } },
      series: [{
        type: 'bar',
        data: values.map((v, i) => ({
          value: v,
          itemStyle: { color: i === 0 ? '#ff3b5c' : i === 1 ? '#ff6b35' : '#00d4aa', borderRadius: [0, 4, 4, 0] },
        })),
        barWidth: 16,
        label: { show: true, position: 'right', color: axisLabelColor, fontSize: 10, formatter: '{c}吨' },
      }],
    }
  }, [enterprises])

  const enforcementOption = useMemo(() => {
    const assigned = enforcementTasks.filter(t => t.status === 'assigned').length
    const inProgress = enforcementTasks.filter(t => t.status === 'in_progress').length
    const completed = enforcementTasks.filter(t => t.status === 'completed').length
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item', backgroundColor: '#1a2332', borderColor: '#2a3548', textStyle: { color: '#e8edf5' } },
      legend: { bottom: 0, textStyle: { color: axisLabelColor, fontSize: 11 }, itemWidth: 10, itemHeight: 10, itemGap: 12 },
      series: [{
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        label: { show: true, position: 'center', formatter: () => `${stats.enforcementTotal}\n总任务`, color: '#e8edf5', fontSize: 14, fontFamily: 'JetBrains Mono', lineHeight: 20 },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
        data: [
          { value: completed, name: '已完成', itemStyle: { color: '#00d4aa' } },
          { value: inProgress, name: '进行中', itemStyle: { color: '#3b82f6' } },
          { value: assigned, name: '待执行', itemStyle: { color: '#fbbf24' } },
        ],
      }],
    }
  }, [enforcementTasks, stats.enforcementTotal])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="排放总量" value={stats.totalEmission.toLocaleString()} unit="吨" icon={<Cloud className="w-4 h-4 text-accent-green" />} color="green" />
        <StatCard label="在线设备数" value={`${stats.onlineDevices}/${stats.totalDevices}`} icon={<Wifi className="w-4 h-4 text-accent-cyan" />} color="cyan" />
        <StatCard label="在线率" value={stats.onlineRate} unit="%" icon={<Activity className="w-4 h-4 text-accent-blue" />} color="blue" />
        <StatCard label="数据有效率" value={stats.dataValidRate} unit="%" icon={<ShieldCheck className="w-4 h-4 text-accent-green" />} color="green" />
        <StatCard label="今日预警" value={stats.todayWarnings} icon={<AlertTriangle className="w-4 h-4 text-accent-orange" />} color="orange" pulse />
        <StatCard label="待处置" value={stats.pendingWarnings} icon={<Clock className="w-4 h-4 text-accent-red" />} color="red" pulse />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-4">
          <SectionTitle>24小时排放趋势</SectionTitle>
          <ReactECharts option={trendOption} style={{ height: 280 }} />
        </div>
        <div className="glass-card p-4">
          <SectionTitle>设备在线率</SectionTitle>
          <ReactECharts option={gaugeOption} style={{ height: 280 }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <SectionTitle>预警等级分布</SectionTitle>
          <ReactECharts option={warningDistOption} style={{ height: 240 }} />
        </div>
        <div className="glass-card p-4">
          <SectionTitle>企业排放排名</SectionTitle>
          <ReactECharts option={enterpriseRankOption} style={{ height: 240 }} />
        </div>
        <div className="glass-card p-4">
          <SectionTitle>执法任务统计</SectionTitle>
          <ReactECharts option={enforcementOption} style={{ height: 240 }} />
        </div>
      </div>
    </div>
  )
}
