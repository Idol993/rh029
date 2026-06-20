import { useStore } from '@/store'
import { Bell, User, ChevronDown, Moon } from 'lucide-react'
import type { UserRole } from '@/types'

const roleLabels: Record<UserRole, string> = {
  enterprise: '企业环保员',
  maintenance: '运维商',
  enforcer: '执法队员',
  admin: '环保局领导',
}

export default function Header() {
  const { currentRole, setRole, stats, sidebarCollapsed } = useStore()

  return (
    <header
      className="fixed top-0 right-0 h-14 z-30 flex items-center justify-between px-5 border-b border-border bg-bg-secondary/90 backdrop-blur-sm"
      style={{ left: sidebarCollapsed ? '64px' : '224px' }}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent-red-dim">
            <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse-red" />
            <span className="text-xs font-medium text-accent-red">{stats.pendingWarnings}</span>
            <span className="text-xs text-accent-red/70">待处置</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent-orange-dim">
            <div className="w-2 h-2 rounded-full bg-accent-orange" />
            <span className="text-xs font-medium text-accent-orange">{stats.todayWarnings}</span>
            <span className="text-xs text-accent-orange/70">今日预警</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-accent-green-dim">
            <div className="w-2 h-2 rounded-full bg-accent-green" />
            <span className="text-xs font-medium text-accent-green">{stats.onlineRate}%</span>
            <span className="text-xs text-accent-green/70">在线率</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative w-8 h-8 rounded-md flex items-center justify-center text-txt-secondary hover:text-txt-primary hover:bg-bg-card transition-colors">
          <Bell className="w-4 h-4" />
          {stats.pendingWarnings > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent-red text-[10px] font-bold text-white flex items-center justify-center">
              {stats.pendingWarnings}
            </span>
          )}
        </button>

        <div className="relative group">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-bg-card transition-colors">
            <div className="w-7 h-7 rounded-full bg-accent-green/20 flex items-center justify-center">
              <User className="w-4 h-4 text-accent-green" />
            </div>
            <span className="text-sm text-txt-primary">{roleLabels[currentRole]}</span>
            <ChevronDown className="w-3 h-3 text-txt-muted" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-36 py-1 rounded-md bg-bg-card border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            {(Object.keys(roleLabels) as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setRole(role)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  currentRole === role ? 'text-accent-green bg-accent-green-dim' : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-card-hover'
                }`}
              >
                {roleLabels[role]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 text-txt-muted">
          <Moon className="w-4 h-4" />
        </div>
      </div>
    </header>
  )
}
