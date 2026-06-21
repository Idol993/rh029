import { useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import { ArrowLeft, Camera, Video, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

const stepLabels = ['下达整改', '企业反馈', '执法复核', '销号确认']

export default function EnforcementDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { enforcementTasks, warningEvents } = useStore()
  const taskId = searchParams.get('task')
  const task = enforcementTasks.find(t => t.id === taskId)

  const warning = useMemo(() =>
    task ? warningEvents.find(w => w.id === task.warningId) : undefined,
    [task, warningEvents]
  )

  if (!task) {
    return (
      <div className="flex items-center justify-center h-96 text-txt-muted">
        未找到执法任务，请从执法管理进入
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate('/enforcement')}
        className="flex items-center gap-1.5 text-sm text-txt-secondary hover:text-accent-green transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回执法管理
      </button>

      <div className="glass-card p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StatusBadge variant={task.status} pulse={task.status === 'in_progress'} />
              <span className="text-sm text-txt-secondary px-1.5 py-0.5 rounded bg-[#1a2332] border border-[#2a3548]">{task.typeName}</span>
            </div>
            <h2 className="text-lg font-semibold text-text-primary">{task.enterpriseName}</h2>
          </div>
          <div className="text-right text-xs text-txt-muted">
            <span>任务编号: {task.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><span className="text-txt-muted text-xs block mb-1">排口编号</span><span className="text-text-primary font-mono">{task.outletCode}</span></div>
          <div><span className="text-txt-muted text-xs block mb-1">执法人</span><span className="text-text-primary">{task.enforcerName}</span></div>
          <div><span className="text-txt-muted text-xs block mb-1">派单时间</span><span className="text-text-primary">{task.assignTime}</span></div>
          {task.completeTime && <div><span className="text-txt-muted text-xs block mb-1">完成时间</span><span className="text-text-primary">{task.completeTime}</span></div>}
        </div>
        <p className="mt-3 text-sm text-txt-secondary">{task.description}</p>
      </div>

      {task.type === 'rectify' && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 border-l-[3px] border-accent-green pl-3">整改进度</h3>
          <div className="flex items-center gap-0 mb-4">
            {stepLabels.map((label, i) => {
              const done = i < task.rectifyStep || (task.status === 'closed' && i < 4)
              const stepTime = task.rectifyStepTimes?.[i] || ''
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={cn('w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-medium',
                      done ? 'bg-accent-green border-accent-green text-white' : 'bg-[var(--bg-secondary)] border-[var(--border)] text-txt-muted'
                    )}>
                      {done ? '✓' : i + 1}
                    </div>
                    <span className={cn('text-[10px] mt-1 whitespace-nowrap', done ? 'text-accent-green' : 'text-txt-muted')}>{label}</span>
                    {stepTime && <span className="text-[9px] text-txt-muted">{stepTime}</span>}
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className={cn('h-0.5 flex-1 -mt-6', done ? 'bg-accent-green' : 'bg-[var(--border)]')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 border-l-[3px] border-accent-cyan pl-3">取证材料 ({task.evidenceFiles.length})</h3>
        {task.evidenceFiles.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {task.evidenceFiles.map(f => (
              <div key={f.id} className="flex flex-col items-center gap-2 p-3 rounded-md bg-[#111827] border border-[#2a3548]">
                {f.type === 'photo' ? (
                  <Camera className="w-8 h-8 text-accent-cyan" />
                ) : (
                  <Video className="w-8 h-8 text-accent-blue" />
                )}
                <span className="text-xs text-text-primary text-center truncate w-full">{f.name}</span>
                <span className="text-[10px] text-txt-muted">{f.size}</span>
                <span className="text-[10px] text-txt-muted">{f.uploadedAt}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-txt-muted py-4 text-center">暂无取证材料</p>
        )}
      </div>

      {warning && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 border-l-[3px] border-accent-orange pl-3">关联预警</h3>
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-accent-orange shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge variant={warning.level} />
                <StatusBadge variant={warning.status} />
              </div>
              <p className="text-sm text-text-primary font-medium">{warning.enterpriseName} - {warning.typeName}</p>
              <p className="text-xs text-txt-secondary mt-1">{warning.description}</p>
              <p className="text-xs text-txt-muted mt-1">触发时间: {warning.triggerTime}</p>
            </div>
            <ExternalLink
              className="w-4 h-4 text-txt-muted shrink-0 cursor-pointer hover:text-accent-cyan mt-1"
              onClick={() => navigate(`/warning/${warning.id}`)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
