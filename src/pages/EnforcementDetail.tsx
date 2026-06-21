import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '@/store'
import StatusBadge from '@/components/StatusBadge'
import { Check, FileText, AlertTriangle, X, ArrowRight, Clock, User, Building, MapPin, Camera, Video, ExternalLink } from 'lucide-react'

const RECTIFY_STEPS = ['下达整改', '整改反馈', '复核检查', '整改销号', '已关闭']

export default function EnforcementDetail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { enforcementTasks, warningEvents } = useStore()
  const taskId = searchParams.get('task')
  const task = enforcementTasks.find(t => t.id === taskId)

  const relatedWarning = task?.warningId ? warningEvents.find(w => w.id === task.warningId) : undefined
  const relatedTasks = task?.warningId
    ? enforcementTasks.filter(t => t.warningId === task.warningId && t.id !== task.id)
    : []
  const rectifyTasks = relatedTasks.filter(t => t.type === 'rectify')
  const checkTasks = relatedTasks.filter(t => t.type === 'check')

  if (!task) {
    return (
      <div className="flex items-center justify-center h-96 text-txt-muted">
        未找到执法任务，请从执法管理进入
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 border-l-[3px] border-accent-green pl-3">
            <span className="text-sm font-semibold text-text-primary">执法任务档案</span>
            <span className="font-mono text-xs text-txt-muted">#{task.id}</span>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge variant={task.status} />
            <button
              onClick={() => navigate('/enforcement')}
              className="text-[11px] text-txt-secondary hover:text-accent-cyan transition-colors"
            >
              返回列表
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <Building className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
            <div>
              <span className="text-txt-muted block text-[10px]">被检查企业</span>
              <span className="text-text-primary font-medium">{task.enterpriseName}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
            <div>
              <span className="text-txt-muted block text-[10px]">排口编号</span>
              <span className="text-text-primary font-mono">{task.outletCode}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
            <div>
              <span className="text-txt-muted block text-[10px]">执法人员</span>
              <span className="text-text-primary font-medium">{task.enforcerName}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-accent-cyan mt-0.5 shrink-0" />
            <div>
              <span className="text-txt-muted block text-[10px]">派单时间</span>
              <span className="text-text-primary font-mono">{task.assignTime}</span>
            </div>
          </div>
        </div>
        {task.description && (
          <div className="mt-3 pt-3 border-t border-[var(--border)] text-[11px] text-txt-secondary">
            {task.description}
          </div>
        )}
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-orange pl-3">
          <span className="text-sm font-semibold text-text-primary">任务流转记录</span>
        </div>
        <div className="relative pl-6 space-y-4">
          <div className="absolute left-[6px] top-1 bottom-1 w-[2px] bg-[var(--border-light)]" />
          <TimelineDot active>
            <span className="text-xs text-text-primary font-medium">已派单 · {task.assignTime}</span>
            <span className="text-[10px] text-txt-muted block mt-0.5">任务分配给 {task.enforcerName}</span>
          </TimelineDot>
          {task.rectifyStepTimes[1] && (
            <TimelineDot active>
              <span className="text-xs text-text-primary font-medium">
                {task.type === 'rectify' ? '整改下达' : '开始现场执法'} · {task.rectifyStepTimes[1]}
              </span>
              <span className="text-[10px] text-txt-muted block mt-0.5">
                {task.type === 'rectify' ? '整改通知书已送达企业' : '执法人员已到达现场'}
              </span>
            </TimelineDot>
          )}
          {task.rectifyStepTimes[2] && (
            <TimelineDot active>
              <span className="text-xs text-text-primary font-medium">
                {task.type === 'rectify' ? '企业反馈材料' : '现场笔录提交'} · {task.rectifyStepTimes[2]}
              </span>
              <span className="text-[10px] text-txt-muted block mt-0.5">
                {task.type === 'rectify' ? `已上传 ${task.rectifyFiles.length} 份反馈材料` : '取证完成，笔录已归档'}
              </span>
            </TimelineDot>
          )}
          {task.rectifyStepTimes[3] && (
            <TimelineDot active>
              <span className="text-xs text-text-primary font-medium">
                {task.type === 'rectify' ? '复核检查完成' : '任务完成'} · {task.rectifyStepTimes[3]}
              </span>
              <span className="text-[10px] text-txt-muted block mt-0.5">
                {task.type === 'rectify' ? '整改措施核查通过' : '执法任务已归档'}
              </span>
            </TimelineDot>
          )}
          {task.rectifyStepTimes[4] && (
            <TimelineDot active success>
              <span className="text-xs text-text-primary font-medium">整改销号 · {task.rectifyStepTimes[4]}</span>
              <span className="text-[10px] text-txt-muted block mt-0.5">全流程闭环完成</span>
            </TimelineDot>
          )}
          {task.status === 'completed' && !task.rectifyStepTimes[3] && (
            <TimelineDot active success>
              <span className="text-xs text-text-primary font-medium">任务完成 · {task.completeTime}</span>
              <span className="text-[10px] text-txt-muted block mt-0.5">执法任务已归档</span>
            </TimelineDot>
          )}
          {task.status === 'closed' && !task.rectifyStepTimes[4] && (
            <TimelineDot active success>
              <span className="text-xs text-text-primary font-medium">任务关闭 · {task.completeTime}</span>
            </TimelineDot>
          )}
        </div>
      </div>

      {task.type === 'rectify' && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 border-l-[3px] border-accent-yellow pl-3">
              <span className="text-sm font-semibold text-text-primary">整改进度</span>
            </div>
            {task.rectifyStep < 4 && (
              <button
                onClick={() => navigate(`/enforcement/rectify?task=${task.id}`)}
                className="text-[11px] text-accent-yellow hover:text-accent-orange transition-colors flex items-center gap-1"
              >
                进入整改销号 <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-0 relative">
            {RECTIFY_STEPS.slice(0, 4).map((label, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center relative z-10">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 transition-colors ${
                  task.rectifyStep >= idx + 1
                    ? 'bg-accent-green border-accent-green text-white'
                    : 'bg-[var(--bg-secondary)] border-[var(--border-light)] text-txt-muted'
                }`}>
                  {task.rectifyStep >= idx + 1 ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span className="text-[10px] mt-1.5 text-txt-secondary">{label}</span>
                {task.rectifyStepTimes[idx + 1] && (
                  <span className="text-[9px] text-txt-muted mt-0.5 font-mono">{task.rectifyStepTimes[idx + 1].slice(5, 16)}</span>
                )}
              </div>
            ))}
            <div className="absolute top-3.5 left-0 right-0 h-[2px] bg-[var(--border-light)] -z-0" />
            <div
              className="absolute top-3.5 left-0 h-[2px] bg-accent-green -z-0 transition-all duration-500"
              style={{ width: `${Math.min(task.rectifyStep, 4) * 33.33}%` }}
            />
          </div>
        </div>
      )}

      {task.record && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-cyan pl-3">
            <FileText className="w-4 h-4 text-accent-cyan" />
            <span className="text-sm font-semibold text-text-primary">现场执法笔录</span>
            {task.record.submittedAt && (
              <span className="text-[10px] text-txt-muted font-mono ml-auto">提交时间 {task.record.submittedAt}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div>
              <span className="text-txt-muted block text-[10px] mb-0.5">检查时间</span>
              <span className="text-text-primary font-mono">{task.record.checkTime}</span>
            </div>
            <div>
              <span className="text-txt-muted block text-[10px] mb-0.5">检查地点</span>
              <span className="text-text-primary">{task.record.checkLocation}</span>
            </div>
            <div>
              <span className="text-txt-muted block text-[10px] mb-0.5">被检查单位</span>
              <span className="text-text-primary">{task.record.checkTarget}</span>
            </div>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-txt-muted block text-[10px] mb-1">检查内容</span>
              <p className="text-text-primary leading-relaxed bg-[var(--bg-secondary)] p-3 rounded">{task.record.checkContent || '无'}</p>
            </div>
            <div>
              <span className="text-txt-muted block text-[10px] mb-1">存在问题</span>
              <p className="text-text-primary leading-relaxed bg-[var(--bg-secondary)] p-3 rounded border-l-2 border-accent-orange">{task.record.problems || '无'}</p>
            </div>
            <div>
              <span className="text-txt-muted block text-[10px] mb-1">处理意见</span>
              <p className="text-text-primary leading-relaxed bg-[var(--bg-secondary)] p-3 rounded border-l-2 border-accent-blue">{task.record.opinion || '无'}</p>
            </div>
          </div>
        </div>
      )}

      {task.evidenceFiles.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-blue pl-3">
            <Camera className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-semibold text-text-primary">取证材料</span>
            <span className="text-[10px] text-txt-muted">({task.evidenceFiles.length})</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {task.evidenceFiles.map(f => (
              <EvidenceCard key={f.id} file={f} />
            ))}
          </div>
        </div>
      )}

      {task.type === 'rectify' && task.rectifyFiles.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-4 border-l-[3px] border-accent-yellow pl-3">
            <FileText className="w-4 h-4 text-accent-yellow" />
            <span className="text-sm font-semibold text-text-primary">企业整改反馈材料</span>
            <span className="text-[10px] text-txt-muted">({task.rectifyFiles.length})</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {task.rectifyFiles.map(f => (
              <EvidenceCard key={f.id} file={f} variant="rectify" />
            ))}
          </div>
        </div>
      )}

      {relatedWarning && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3 border-l-[3px] border-accent-red pl-3">
            <AlertTriangle className="w-4 h-4 text-accent-red" />
            <span className="text-sm font-semibold text-text-primary">关联预警</span>
          </div>
          <button
            onClick={() => navigate(`/warning/${relatedWarning.id}`)}
            className="w-full flex items-center justify-between p-3 rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-light)]/30 transition-colors text-left"
          >
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge variant={relatedWarning.status} size="sm" />
                <span className="text-xs text-text-primary font-medium">{relatedWarning.typeName}</span>
              </div>
              <p className="text-[11px] text-txt-secondary mt-1">{relatedWarning.description}</p>
              <span className="text-[10px] text-txt-muted font-mono mt-1 block">{relatedWarning.triggerTime}</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-txt-muted" />
          </button>
        </div>
      )}

      {(rectifyTasks.length > 0 || checkTasks.length > 0) && (
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-3 border-l-[3px] border-accent-purple pl-3">
            <ExternalLink className="w-4 h-4 text-accent-purple" />
            <span className="text-sm font-semibold text-text-primary">关联任务</span>
          </div>
          <div className="space-y-2">
            {rectifyTasks.map(t => (
              <button
                key={t.id}
                onClick={() => navigate(`/enforcement/detail?task=${t.id}`)}
                className="w-full flex items-center justify-between p-3 rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-light)]/30 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-orange-dim text-accent-orange">整改督办</span>
                    <StatusBadge variant={t.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-text-primary mt-1 font-medium">{t.description}</p>
                  <span className="text-[10px] text-txt-muted font-mono mt-1 block">{t.id} · {t.assignTime}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-txt-muted" />
              </button>
            ))}
            {checkTasks.map(t => (
              <button
                key={t.id}
                onClick={() => navigate(`/enforcement/detail?task=${t.id}`)}
                className="w-full flex items-center justify-between p-3 rounded bg-[var(--bg-secondary)] hover:bg-[var(--border-light)]/30 transition-colors text-left"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent-blue-dim text-accent-blue">现场检查</span>
                    <StatusBadge variant={t.status} size="sm" />
                  </div>
                  <p className="text-[11px] text-text-primary mt-1 font-medium">{t.description}</p>
                  <span className="text-[10px] text-txt-muted font-mono mt-1 block">{t.id} · {t.assignTime}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-txt-muted" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TimelineDot({ children, active, success }: { children: React.ReactNode; active?: boolean; success?: boolean }) {
  return (
    <div className="relative">
      <div className={`absolute -left-6 top-0.5 w-3 h-3 rounded-full ${
        success ? 'bg-accent-green' : active ? 'bg-accent-cyan' : 'bg-[var(--border-light)]'
      } border-2 border-[var(--bg-secondary)]`} />
      <div>{children}</div>
    </div>
  )
}

function EvidenceCard({ file, variant = 'enforcement' }: { file: ReturnType<typeof useStore.getState>['enforcementTasks'][number]['evidenceFiles'][number]; variant?: 'enforcement' | 'rectify' }) {
  const accentCls = variant === 'rectify'
    ? 'bg-accent-yellow-dim/40 border-accent-yellow/40'
    : 'bg-accent-blue-dim/40 border-accent-blue/40'
  return (
    <div className={`rounded border p-2.5 ${accentCls}`}>
      <div className="aspect-video rounded bg-[var(--bg-secondary)]/70 flex items-center justify-center mb-2">
        {file.type === 'photo'
          ? <Camera className="w-6 h-6 text-txt-secondary" />
          : file.type === 'video'
          ? <Video className="w-6 h-6 text-txt-secondary" />
          : <FileText className="w-6 h-6 text-txt-secondary" />}
      </div>
      <div className="space-y-0.5">
        <p className="text-[10px] text-text-primary truncate font-medium">{file.name}</p>
        <div className="flex items-center justify-between text-[9px] text-txt-muted">
          <span>{file.size}</span>
          <span className="font-mono">{file.uploadedAt.slice(5, 16)}</span>
        </div>
      </div>
    </div>
  )
}
