import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/store'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'
import { cn } from '@/lib/utils'
import { ClipboardList, CheckCircle, Loader, Percent } from 'lucide-react'

type TypeFilter = '全部' | '现场检查' | '整改督办' | '复核销号'

const typeFilters: TypeFilter[] = ['全部', '现场检查', '整改督办', '复核销号']

const typeIconMap: Record<string, string> = {
  check: '🔍',
  rectify: '🔧',
  penalty: '⚖️',
  review: '✅',
}

export default function EnforcementList() {
  const navigate = useNavigate()
  const { enforcementTasks, warningEvents, startEnforcement, completeEnforcement, createRectifyFromEnforcement } = useStore()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('全部')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const totalCount = enforcementTasks.length
  const completedCount = enforcementTasks.filter(t => t.status === 'completed' || t.status === 'closed').length
  const inProgressCount = enforcementTasks.filter(t => t.status === 'in_progress').length
  const completionRate = totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : '0'

  const filtered = useMemo(() => {
    let list = enforcementTasks
    if (typeFilter !== '全部') {
      const typeMap: Record<string, string> = { '现场检查': 'check', '整改督办': 'rectify', '复核销号': 'review' }
      list = list.filter(t => t.type === typeMap[typeFilter])
    }
    if (statusFilter !== 'all') {
      list = list.filter(t => t.status === statusFilter)
    }
    return list
  }, [enforcementTasks, typeFilter, statusFilter])

  const getActionButtons = (task: typeof enforcementTasks[0]) => {
    switch (task.status) {
      case 'assigned':
        return (
          <>
            <button
              onClick={() => {
                startEnforcement(task.id)
                navigate(`/enforcement/onsite?task=${task.id}`)
              }}
              className="px-3 py-1 rounded text-[11px] font-medium bg-accent-blue-dim text-accent-blue hover:bg-accent-blue/20 transition-colors"
            >开始执行</button>
            <button className="px-3 py-1 rounded text-[11px] font-medium bg-[var(--bg-secondary)] text-txt-secondary hover:text-text-primary transition-colors">转派</button>
          </>
        )
      case 'in_progress':
        return (
          <>
            <button
              onClick={() => navigate(`/enforcement/onsite?task=${task.id}`)}
              className="px-3 py-1 rounded text-[11px] font-medium bg-accent-cyan-dim text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
            >继续执行</button>
            <button
              onClick={() => { completeEnforcement(task.id); showToast('已提交结果') }}
              className="px-3 py-1 rounded text-[11px] font-medium bg-accent-green-dim text-accent-green hover:bg-accent-green/20 transition-colors"
            >提交结果</button>
            <button
              onClick={() => { const rid = createRectifyFromEnforcement(task.id); showToast(`整改任务已下达，编号${rid}`) }}
              className="px-3 py-1 rounded text-[11px] font-medium bg-accent-orange-dim text-accent-orange hover:bg-accent-orange/20 transition-colors"
            >下达整改</button>
          </>
        )
      case 'completed':
        return (
          <button
            onClick={() => navigate(`/enforcement/detail?task=${task.id}`)}
            className="px-3 py-1 rounded text-[11px] font-medium bg-accent-cyan-dim text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
          >查看详情</button>
        )
      case 'closed':
        return (
          <button
            onClick={() => navigate(`/enforcement/detail?task=${task.id}`)}
            className="px-3 py-1 rounded text-[11px] font-medium bg-accent-cyan-dim text-accent-cyan hover:bg-accent-cyan/20 transition-colors"
          >查看详情</button>
        )
      default:
        return null
    }
  }

  const getWarningLink = (task: typeof enforcementTasks[0]) => {
    if (!task.warningId) return null
    const w = warningEvents.find(w => w.id === task.warningId)
    if (!w) return null
    return (
      <span className="text-[10px] text-accent-cyan cursor-pointer hover:underline" onClick={() => navigate(`/warning/${w.id}`)}>
        关联预警: {w.typeName}
      </span>
    )
  }

  return (
    <div className="space-y-5">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-lg bg-accent-green/90 text-white text-sm font-medium shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="任务总数" value={totalCount} icon={<ClipboardList className="w-4 h-4 text-accent-blue" />} color="blue" />
        <StatCard label="已完成" value={completedCount} icon={<CheckCircle className="w-4 h-4 text-accent-green" />} color="green" />
        <StatCard label="进行中" value={inProgressCount} icon={<Loader className="w-4 h-4 text-accent-cyan" />} color="cyan" />
        <StatCard label="办结率" value={completionRate} unit="%" icon={<Percent className="w-4 h-4 text-accent-orange" />} color="orange" />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-md bg-[var(--bg-card)]">
          {typeFilters.map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} className={cn('px-3 py-1.5 rounded text-xs font-medium transition-colors', typeFilter === f ? 'bg-accent-green-dim text-accent-green' : 'text-txt-secondary hover:text-text-primary')}>
              {f}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded text-xs bg-[var(--bg-card)] border border-[var(--border)] text-text-primary focus:outline-none focus:border-accent-green"
        >
          <option value="all">全部状态</option>
          <option value="assigned">已派单</option>
          <option value="in_progress">进行中</option>
          <option value="completed">已完成</option>
          <option value="closed">已销号</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(task => (
          <div key={task.id} className="glass-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-base">{typeIconMap[task.type] || '📋'}</span>
                  <span className="text-sm font-semibold text-text-primary">{task.typeName}</span>
                  <StatusBadge variant={task.status} pulse={task.status === 'in_progress'} />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-txt-muted">企业:</span>
                    <span className="text-text-primary">{task.enterpriseName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-txt-muted">排口:</span>
                    <span className="text-text-primary font-mono">{task.outletCode}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-txt-muted">执法人:</span>
                    <span className="text-text-primary">{task.enforcerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-txt-muted">派单时间:</span>
                    <span className="text-txt-secondary">{task.assignTime}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-txt-secondary">{task.description}</p>
                {getWarningLink(task) && <div className="mt-1">{getWarningLink(task)}</div>}
                {task.evidenceFiles.length > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-[10px] text-txt-muted">取证材料:</span>
                    {task.evidenceFiles.map(f => (
                      <span key={f.id} className="text-[10px] text-accent-cyan bg-accent-cyan-dim px-1.5 py-0.5 rounded">{f.name}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getActionButtons(task)}
              </div>
            </div>
            {task.status === 'completed' && task.completeTime && (
              <div className="mt-2 pt-2 border-t border-[var(--border)]/50 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-accent-green-dim overflow-hidden">
                  <div className="h-full rounded-full bg-accent-green w-full transition-all" />
                </div>
                <span className="text-[10px] text-txt-muted">完成于 {task.completeTime}</span>
              </div>
            )}
            {task.status === 'closed' && task.completeTime && (
              <div className="mt-2 pt-2 border-t border-[var(--border)]/50 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-accent-green-dim overflow-hidden">
                  <div className="h-full rounded-full bg-accent-green w-full transition-all" />
                </div>
                <span className="text-[10px] text-txt-muted">销号于 {task.completeTime}</span>
              </div>
            )}
            {task.status === 'in_progress' && (
              <div className="mt-2 pt-2 border-t border-[var(--border)]/50 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full bg-accent-blue-dim overflow-hidden">
                  <div className="h-full rounded-full bg-accent-blue w-3/5 animate-pulse transition-all" />
                </div>
                <span className="text-[10px] text-accent-blue">执行中</span>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="glass-card p-8 text-center text-txt-muted text-sm">暂无匹配的执法任务</div>
        )}
      </div>
    </div>
  )
}
