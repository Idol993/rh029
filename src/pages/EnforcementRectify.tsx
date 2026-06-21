import { useMemo, useState } from 'react'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import ReactECharts from 'echarts-for-react'
import { cn } from '@/lib/utils'
import { ClipboardCheck, Wrench, CheckCircle2, Percent, Upload, CheckCircle, XCircle, Camera, Video } from 'lucide-react'

const axisColor = '#8896ab'
const splitColor = '#2a3548'

const stepLabels = ['下达整改', '企业反馈', '执法复核', '销号确认']

export default function EnforcementRectify() {
  const { enforcementTasks, warningEvents, startEnforcement, completeEnforcement, setRectifyStep, closeRectify } = useStore()
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const rectifyTasks = useMemo(() => enforcementTasks.filter(t => t.type === 'rectify'), [enforcementTasks])

  const getCurrentStep = (task: typeof rectifyTasks[0]): number => {
    if (task.status === 'closed') return 4
    return task.rectifyStep
  }

  const getWarningContext = (warningId: string) => warningEvents.find(w => w.id === warningId)

  const pendingCount = rectifyTasks.filter(t => t.status === 'assigned').length
  const inProgressCount = rectifyTasks.filter(t => t.status === 'in_progress').length
  const closedCount = rectifyTasks.filter(t => t.status === 'closed').length
  const completedCount = rectifyTasks.filter(t => t.status === 'completed').length
  const closeRate = rectifyTasks.length > 0 ? ((closedCount / rectifyTasks.length) * 100).toFixed(1) : '0'

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

  const handleStartRectify = (taskId: string) => {
    startEnforcement(taskId)
    setRectifyStep(taskId, 1)
    showToast('已开始整改')
  }

  const handleSubmitReview = (taskId: string) => {
    setRectifyStep(taskId, 2)
    showToast('已提交复核')
  }

  const handleApproveReview = (taskId: string) => {
    completeEnforcement(taskId)
    setRectifyStep(taskId, 3)
    showToast('复核已通过')
  }

  const handleRejectRectify = (taskId: string) => {
    setRectifyStep(taskId, 1)
    showToast('整改已驳回，请重新整改')
  }

  const handleCloseConfirm = (taskId: string) => {
    closeRectify(taskId)
    showToast('已销号确认，整改闭环完成')
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg bg-accent-green/90 text-white text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="待整改" value={pendingCount} icon={<ClipboardCheck className="w-4 h-4 text-accent-orange" />} color="orange" pulse />
        <StatCard label="整改中" value={inProgressCount} icon={<Wrench className="w-4 h-4 text-accent-blue" />} color="blue" />
        <StatCard label="已销号" value={closedCount} icon={<CheckCircle2 className="w-4 h-4 text-accent-green" />} color="green" />
        <StatCard label="销号率" value={closeRate} unit="%" icon={<Percent className="w-4 h-4 text-accent-cyan" />} color="cyan" />
      </div>

      <div className="space-y-4">
        {rectifyTasks.map(task => {
          const currentStep = getCurrentStep(task)
          const warning = getWarningContext(task.warningId)
          const steps = stepLabels.map((label, i) => ({
            label,
            done: i < currentStep,
          }))

          return (
            <div key={task.id} className="glass-card p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">{task.enterpriseName}</h3>
                  <p className="text-xs text-accent-red">
                    {warning ? `${warning.typeName}：${warning.description}` : task.description}
                  </p>
                </div>
                <span className={cn('text-[11px] px-2 py-0.5 rounded font-medium shrink-0',
                  task.status === 'closed' ? 'bg-accent-green-dim text-accent-green' :
                  currentStep === 0 ? 'bg-accent-orange-dim text-accent-orange' :
                  currentStep >= 3 ? 'bg-accent-cyan-dim text-accent-cyan' :
                  'bg-accent-blue-dim text-accent-blue'
                )}>
                  {task.status === 'closed' ? '已销号' : currentStep === 0 ? '待整改' : currentStep >= 3 ? '待销号' : '整改中'}
                </span>
              </div>

              <div className="text-xs text-txt-secondary mb-4">
                <span className="text-txt-muted">整改要求：</span>{task.description}
                <span className="ml-4 text-txt-muted">派单时间：</span>
                <span className="text-text-primary">{task.assignTime}</span>
              </div>

              <div className="flex items-center gap-0 mb-4">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-medium transition-all', getStepStyle(step.done, i === currentStep))}>
                        {step.done ? '✓' : i + 1}
                      </div>
                      <span className={cn('text-[10px] mt-1 whitespace-nowrap', step.done ? 'text-accent-green' : i === currentStep ? 'text-accent-blue' : 'text-txt-muted')}>
                        {step.label}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={cn('h-0.5 flex-1 -mt-4', step.done ? 'bg-accent-green' : 'bg-[var(--border)]')} />
                    )}
                  </div>
                ))}
              </div>

              {task.evidenceFiles.length > 0 && (
                <div className="mb-3 pt-3 border-t border-[var(--border)]/30">
                  <span className="text-[11px] text-txt-muted block mb-1.5">关联取证材料:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {task.evidenceFiles.map(f => (
                      <span key={f.id} className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-[var(--bg-secondary)] text-txt-secondary">
                        {f.type === 'photo' ? <Camera className="w-3 h-3 text-accent-cyan" /> : <Video className="w-3 h-3 text-accent-blue" />}
                        {f.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {task.status !== 'closed' && (
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]/50">
                  <div className="flex items-center gap-2">
                    {currentStep >= 1 && currentStep < 3 && (
                      <button className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-cyan-dim text-accent-cyan hover:bg-accent-cyan/20 transition-colors flex items-center gap-1">
                        <Upload className="w-3 h-3" />上传整改材料
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {currentStep === 0 && (
                      <button
                        onClick={() => handleStartRectify(task.id)}
                        className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-blue-dim text-accent-blue hover:bg-accent-blue/20 transition-colors"
                      >开始整改</button>
                    )}
                    {currentStep === 1 && (
                      <button
                        onClick={() => handleSubmitReview(task.id)}
                        className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-green-dim text-accent-green hover:bg-accent-green/20 transition-colors"
                      >提交复核</button>
                    )}
                    {currentStep === 2 && (
                      <>
                        <button
                          onClick={() => handleApproveReview(task.id)}
                          className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-green-dim text-accent-green hover:bg-accent-green/20 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />通过复核
                        </button>
                        <button
                          onClick={() => handleRejectRectify(task.id)}
                          className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-red-dim text-accent-red hover:bg-accent-red/20 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />驳回整改
                        </button>
                      </>
                    )}
                    {currentStep >= 3 && (
                      <button
                        onClick={() => handleCloseConfirm(task.id)}
                        className="px-3 py-1.5 rounded text-[11px] font-medium bg-accent-green text-white hover:bg-accent-green/90 transition-colors"
                      >销号确认</button>
                    )}
                  </div>
                </div>
              )}

              {task.status === 'closed' && task.completeTime && (
                <div className="pt-3 border-t border-[var(--border)]/50 text-[10px] text-txt-muted">
                  销号时间: {task.completeTime}
                </div>
              )}
            </div>
          )
        })}
        {rectifyTasks.length === 0 && (
          <div className="glass-card p-8 text-center text-txt-muted text-sm">暂无整改任务</div>
        )}
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
