import { useMemo } from 'react'
import StatCard from '@/components/StatCard'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'

interface QualityRecord {
  id: string
  deviceCode: string
  enterpriseName: string
  pollutant: string
  value: number
  unit: string
  time: string
  flag: 'valid' | 'invalid' | 'suspect'
}

interface MarkRecord {
  id: string
  deviceCode: string
  markType: string
  startTime: string
  endTime: string
  auditStatus: 'pending' | 'approved' | 'rejected'
}

const flagStyles: Record<string, string> = {
  valid: 'bg-accent-green-dim text-accent-green',
  suspect: 'bg-accent-orange-dim text-accent-orange',
  invalid: 'bg-accent-red-dim text-accent-red',
}

const flagLabels: Record<string, string> = {
  valid: '有效',
  suspect: '可疑',
  invalid: '无效',
}

const qualityRecords: QualityRecord[] = [
  { id: 'qr1', deviceCode: 'DEV-W-001', enterpriseName: '华泰化工', pollutant: 'COD', value: 89.5, unit: 'mg/L', time: '06-21 06:00', flag: 'suspect' },
  { id: 'qr2', deviceCode: 'DEV-W-003', enterpriseName: '绿洲纸业', pollutant: 'COD', value: -2.3, unit: 'mg/L', time: '06-21 05:30', flag: 'invalid' },
  { id: 'qr3', deviceCode: 'DEV-G-002', enterpriseName: '恒通钢铁', pollutant: 'SO₂', value: 5.0, unit: 'mg/m³', time: '06-20 22:00', flag: 'suspect' },
  { id: 'qr4', deviceCode: 'DEV-W-001', enterpriseName: '华泰化工', pollutant: 'NH₃-N', value: 6.2, unit: 'mg/L', time: '06-21 08:00', flag: 'valid' },
  { id: 'qr5', deviceCode: 'DEV-W-002', enterpriseName: '鑫源印染', pollutant: 'COD', value: 55.3, unit: 'mg/L', time: '06-21 07:00', flag: 'valid' },
]

const markRecords: MarkRecord[] = [
  { id: 'mk1', deviceCode: 'DEV-W-003', markType: '异常', startTime: '2026-06-21 05:00', endTime: '2026-06-21 09:00', auditStatus: 'pending' },
  { id: 'mk2', deviceCode: 'DEV-W-004', markType: '停运', startTime: '2026-06-21 06:00', endTime: '-', auditStatus: 'pending' },
  { id: 'mk3', deviceCode: 'DEV-G-002', markType: '缺失', startTime: '2026-06-20 20:00', endTime: '2026-06-20 22:00', auditStatus: 'approved' },
  { id: 'mk4', deviceCode: 'DEV-W-001', markType: '检修', startTime: '2026-06-19 10:00', endTime: '2026-06-19 12:00', auditStatus: 'approved' },
]

const auditStatusStyles: Record<string, string> = {
  pending: 'bg-accent-orange-dim text-accent-orange',
  approved: 'bg-accent-green-dim text-accent-green',
  rejected: 'bg-accent-red-dim text-accent-red',
}

const auditStatusLabels: Record<string, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
}

export default function MaintenanceQuality() {
  const trendOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1a2332',
      borderColor: '#2a3548',
      textStyle: { color: '#e8edf5', fontSize: 11 },
    },
    title: {
      text: '质控趋势',
      textStyle: { color: '#e8edf5', fontSize: 13, fontWeight: 500 },
      left: 0,
      top: 0,
    },
    grid: { top: 40, right: 16, bottom: 24, left: 48 },
    xAxis: {
      type: 'category',
      data: ['06-15', '06-16', '06-17', '06-18', '06-19', '06-20', '06-21'],
      axisLine: { lineStyle: { color: '#2a3548' } },
      axisLabel: { color: '#8896ab', fontSize: 10 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 90,
      max: 100,
      axisLine: { show: false },
      axisLabel: { color: '#8896ab', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#2a3548', type: 'dashed' } },
    },
    series: [{
      name: '质控通过率',
      type: 'line',
      data: [97.1, 96.8, 95.3, 96.5, 97.2, 95.8, 96.2],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2, color: '#00d4aa' },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(0,212,170,0.25)' },
            { offset: 1, color: 'transparent' },
          ],
        },
      },
    }],
  }), [])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="质控通过率" value="96.2" unit="%" color="green" />
        <StatCard label="待审核" value={3} color="orange" pulse />
        <StatCard label="已审核" value={15} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-green pl-3">
            <span className="text-sm font-semibold text-text-primary">质控数据审核</span>
          </div>
          <div className="space-y-3">
            {qualityRecords.map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 rounded-lg bg-bg-card-hover/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-txt-secondary">{record.deviceCode}</span>
                    <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', flagStyles[record.flag])}>
                      {flagLabels[record.flag]}
                    </span>
                  </div>
                  <div className="text-xs text-txt-muted">
                    {record.enterpriseName} · {record.pollutant} · <span className="stat-value">{record.value}</span>{record.unit} · {record.time}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button className="px-2 py-1 rounded text-[10px] font-medium bg-accent-green-dim text-accent-green hover:opacity-80">
                    通过
                  </button>
                  <button className="px-2 py-1 rounded text-[10px] font-medium bg-accent-red-dim text-accent-red hover:opacity-80">
                    驳回
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-4">
          <ReactECharts option={trendOption} style={{ height: 300 }} />
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-cyan pl-3">
          <span className="text-sm font-semibold text-text-primary">标记管理</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-txt-muted border-b border-border">
                <th className="text-left py-2 px-3 font-medium">设备</th>
                <th className="text-left py-2 px-3 font-medium">标记类型</th>
                <th className="text-left py-2 px-3 font-medium">开始时间</th>
                <th className="text-left py-2 px-3 font-medium">结束时间</th>
                <th className="text-center py-2 px-3 font-medium">审核状态</th>
                <th className="text-center py-2 px-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {markRecords.map(mark => (
                <tr key={mark.id} className="border-b border-border/50 hover:bg-bg-card-hover transition-colors">
                  <td className="py-2 px-3 text-txt-secondary font-mono">{mark.deviceCode}</td>
                  <td className="py-2 px-3 text-txt-secondary">{mark.markType}</td>
                  <td className="py-2 px-3 text-txt-muted font-mono">{mark.startTime}</td>
                  <td className="py-2 px-3 text-txt-muted font-mono">{mark.endTime}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={cn('px-2 py-0.5 rounded text-[10px] font-medium', auditStatusStyles[mark.auditStatus])}>
                      {auditStatusLabels[mark.auditStatus]}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {mark.auditStatus === 'pending' ? (
                      <div className="flex items-center justify-center gap-2">
                        <button className="px-2 py-0.5 rounded text-[10px] bg-accent-green-dim text-accent-green">通过</button>
                        <button className="px-2 py-0.5 rounded text-[10px] bg-accent-red-dim text-accent-red">驳回</button>
                      </div>
                    ) : (
                      <span className="text-txt-muted">-</span>
                    )}
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
