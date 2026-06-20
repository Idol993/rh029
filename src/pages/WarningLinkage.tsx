import { useState } from 'react'
import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { ToggleLeft, ToggleRight } from 'lucide-react'

interface Strategy {
  id: string
  name: string
  desc: string
  icon: string
  enabled: boolean
  permission: 'auto' | 'supervisor' | 'admin'
  controlPoint: string
}

interface ExecLog {
  id: string
  time: string
  strategy: string
  auto: boolean
  action: string
  result: string
}

const initStrategies: Strategy[] = [
  { id: 's1', name: '阀门锁定', desc: '超标时自动锁定排污阀门', icon: '🔒', enabled: true, permission: 'supervisor', controlPoint: '主排污阀' },
  { id: 's2', name: '限流控制', desc: '自动限制排放流量至设定比例', icon: '💧', enabled: true, permission: 'auto', controlPoint: '流量调节阀' },
  { id: 's3', name: '停机控制', desc: '紧急情况下停止生产设备运行', icon: '⚡', enabled: false, permission: 'admin', controlPoint: '主控电源' },
]

const execLogs: ExecLog[] = [
  { id: 'l1', time: '2026-06-21 08:15:30', strategy: '阀门锁定', auto: true, action: '锁定华泰化工WS-E1-001排污阀', result: '执行成功' },
  { id: 'l2', time: '2026-06-21 08:15:32', strategy: '限流控制', auto: true, action: '限流华泰化工WS-E1-001至50%', result: '执行成功' },
  { id: 'l3', time: '2026-06-21 07:30:05', strategy: '阀门锁定', auto: true, action: '锁定华泰化工GAS-E1-001排污阀', result: '执行成功' },
  { id: 'l4', time: '2026-06-21 05:20:15', strategy: '阀门锁定', auto: false, action: '锁定绿洲纸业WS-E4-001排污阀', result: '执行成功' },
  { id: 'l5', time: '2026-06-21 05:20:18', strategy: '限流控制', auto: true, action: '限流绿洲纸业WS-E4-001至50%', result: '执行成功' },
  { id: 'l6', time: '2026-06-20 22:00:10', strategy: '限流控制', auto: false, action: '限流恒通钢铁GAS-E3-001至30%', result: '手动撤销' },
]

const permLabels: Record<string, string> = { auto: '自动', supervisor: '主管审批', admin: '管理员审批' }

type ControlAction = 'lock' | 'throttle' | 'shutdown'

interface ControlState {
  action: ControlAction
  label: string
  statusLabel: string
  activeColor: string
  inactiveColor: string
  status: 'normal' | 'locked' | 'throttled' | 'shutdown'
}

const controls: ControlState[] = [
  { action: 'lock', label: '锁定排污阀门', statusLabel: '已锁定', activeColor: 'bg-accent-red', inactiveColor: 'bg-accent-green', status: 'normal' },
  { action: 'throttle', label: '限流50%', statusLabel: '已限流', activeColor: 'bg-accent-orange', inactiveColor: 'bg-accent-green', status: 'normal' },
  { action: 'shutdown', label: '紧急停机', statusLabel: '已停机', activeColor: 'bg-accent-red', inactiveColor: 'bg-accent-green', status: 'normal' },
]

export default function WarningLinkage() {
  const { stats } = useStore()
  const [strategies, setStrategies] = useState(initStrategies)
  const [controlStates, setControlStates] = useState<Record<ControlAction, { active: boolean; confirmed: boolean }>>({
    lock: { active: false, confirmed: false },
    throttle: { active: false, confirmed: false },
    shutdown: { active: false, confirmed: false },
  })

  const toggleStrategy = (id: string) => {
    setStrategies((prev) => prev.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s))
  }

  const changePermission = (id: string, perm: Strategy['permission']) => {
    setStrategies((prev) => prev.map((s) => s.id === id ? { ...s, permission: perm } : s))
  }

  const handleControlClick = (action: ControlAction) => {
    const state = controlStates[action]
    if (!state.confirmed) {
      setControlStates((prev) => ({ ...prev, [action]: { ...prev[action], confirmed: true } }))
    } else {
      setControlStates((prev) => ({ ...prev, [action]: { active: !prev[action].active, confirmed: false } }))
    }
  }

  const statusLabel = (action: ControlAction) => {
    return controlStates[action].active
      ? controls.find((c) => c.action === action)!.statusLabel
      : '正常'
  }

  const statusColor = (action: ControlAction) => {
    return controlStates[action].active
      ? controls.find((c) => c.action === action)!.activeColor
      : controls.find((c) => c.action === action)!.inactiveColor
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <span className="text-xs text-txt-secondary font-medium block mb-2">联动策略数</span>
          <span className="stat-value text-2xl text-accent-cyan">{strategies.length}</span>
        </div>
        <div className="glass-card p-4">
          <span className="text-xs text-txt-secondary font-medium block mb-2">今日触发次数</span>
          <span className="stat-value text-2xl text-accent-orange">{stats.todayWarnings}</span>
        </div>
        <div className="glass-card p-4">
          <span className="text-xs text-txt-secondary font-medium block mb-2">自动执行次数</span>
          <span className="stat-value text-2xl text-accent-green">12</span>
        </div>
        <div className="glass-card p-4">
          <span className="text-xs text-txt-secondary font-medium block mb-2">人工介入次数</span>
          <span className="stat-value text-2xl text-accent-yellow">3</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary border-l-[3px] border-accent-green pl-3">联动策略配置</h3>
          {strategies.map((s) => (
            <div key={s.id} className="glass-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-sm font-semibold text-text-primary">{s.name}</span>
                  </div>
                  <p className="text-xs text-txt-muted mb-2">{s.desc}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-txt-muted">控制点: <span className="text-txt-secondary">{s.controlPoint}</span></span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-txt-muted">权限:</span>
                    {(['auto', 'supervisor', 'admin'] as const).map((perm) => (
                      <button
                        key={perm}
                        onClick={() => changePermission(s.id, perm)}
                        className={cn(
                          'px-2 py-0.5 rounded text-[10px] font-medium transition-all',
                          s.permission === perm
                            ? 'bg-accent-green-dim text-accent-green'
                            : 'text-txt-muted hover:text-txt-secondary'
                        )}
                      >
                        {permLabels[perm]}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={() => toggleStrategy(s.id)} className="shrink-0 mt-1">
                  {s.enabled ? (
                    <ToggleRight className="w-8 h-8 text-accent-green" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-txt-muted" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4 border-l-[3px] border-accent-green pl-3">执行日志</h3>
          <div className="space-y-0 max-h-[440px] overflow-y-auto">
            {execLogs.map((log, i) => (
              <div key={log.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-2.5 h-2.5 rounded-full shrink-0 mt-1.5',
                    log.auto ? 'bg-accent-green' : 'bg-accent-yellow'
                  )} />
                  {i < execLogs.length - 1 && <div className="w-0.5 flex-1 min-h-[32px] bg-[#2a3548]" />}
                </div>
                <div className="pb-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-primary">{log.strategy}</span>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded',
                      log.auto ? 'bg-accent-green-dim text-accent-green' : 'bg-accent-yellow-dim text-accent-yellow'
                    )}>
                      {log.auto ? '自动' : '手动'}
                    </span>
                  </div>
                  <p className="text-xs text-txt-secondary mt-0.5 truncate">{log.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-txt-muted">{log.time}</span>
                    <span className={cn(
                      'text-[10px]',
                      log.result === '执行成功' ? 'text-accent-green' : 'text-accent-yellow'
                    )}>{log.result}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4 border-l-[3px] border-accent-red pl-3">远程控制面板（模拟）</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {controls.map((ctrl) => {
            const state = controlStates[ctrl.action]
            return (
              <div key={ctrl.action} className="p-4 rounded-lg bg-[#111827] border border-[#2a3548] text-center space-y-3">
                <div className={cn(
                  'w-4 h-4 rounded-full mx-auto',
                  statusColor(ctrl.action),
                  controlStates[ctrl.action].active && 'animate-pulse'
                )} />
                <span className="text-xs text-txt-secondary block">{statusLabel(ctrl.action)}</span>
                <button
                  onClick={() => handleControlClick(ctrl.action)}
                  className={cn(
                    'w-full py-3 rounded-md text-sm font-semibold transition-all',
                    state.confirmed
                      ? 'bg-accent-red text-white animate-pulse-red'
                      : state.active
                        ? 'bg-accent-red/20 text-accent-red border border-accent-red/40'
                        : 'bg-[#2a3548] text-txt-secondary hover:bg-[#374357] hover:text-text-primary border border-transparent'
                  )}
                >
                  {state.confirmed ? `确认${ctrl.label}` : ctrl.label}
                </button>
                <p className="text-[10px] text-txt-muted">
                  {state.confirmed ? '再次点击确认执行' : '点击后需二次确认'}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
