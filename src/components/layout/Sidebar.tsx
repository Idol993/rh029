import { Link, useLocation } from 'react-router-dom'
import { useStore } from '@/store'
import type { UserRole } from '@/types'
import {
  LayoutDashboard, Activity, AlertTriangle, Calculator,
  Shield, Wrench, CheckCircle, ChevronLeft, ChevronRight,
  Droplets, Wind, Factory, Cpu, FileText, ClipboardList,
  Search, BookOpen
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  path: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: '监控中心',
    items: [
      { path: '/dashboard', label: '监管驾驶舱', icon: LayoutDashboard, roles: ['admin', 'enterprise', 'enforcer', 'maintenance'] },
    ],
  },
  {
    label: '实时监测',
    items: [
      { path: '/monitor', label: '点位总览', icon: Activity, roles: ['admin', 'enterprise', 'enforcer'] },
      { path: '/monitor/water', label: '废水监测', icon: Droplets, roles: ['admin', 'enterprise', 'enforcer'] },
      { path: '/monitor/gas', label: '废气监测', icon: Wind, roles: ['admin', 'enterprise', 'enforcer'] },
      { path: '/monitor/facility', label: '治污设施', icon: Factory, roles: ['admin', 'enterprise'] },
    ],
  },
  {
    label: '预警联动',
    items: [
      { path: '/warning', label: '超标预警', icon: AlertTriangle, roles: ['admin', 'enterprise', 'enforcer'] },
      { path: '/warning/linkage', label: '应急联动', icon: Shield, roles: ['admin'] },
    ],
  },
  {
    label: '合规管理',
    items: [
      { path: '/tax', label: '环保税核算', icon: Calculator, roles: ['admin', 'enterprise'] },
      { path: '/tax/ledger', label: '排放台账', icon: BookOpen, roles: ['admin', 'enterprise'] },
      { path: '/enforcement', label: '执法管理', icon: CheckCircle, roles: ['admin', 'enforcer'] },
      { path: '/enforcement/onsite', label: '现场执法', icon: ClipboardList, roles: ['enforcer'] },
      { path: '/enforcement/rectify', label: '整改销号', icon: FileText, roles: ['admin', 'enforcer'] },
    ],
  },
  {
    label: '运维质控',
    items: [
      { path: '/maintenance', label: '设备台账', icon: Wrench, roles: ['admin', 'maintenance'] },
      { path: '/maintenance/orders', label: '运维工单', icon: ClipboardList, roles: ['maintenance', 'admin'] },
      { path: '/maintenance/quality', label: '质控审核', icon: CheckCircle, roles: ['admin', 'maintenance'] },
      { path: '/quality', label: '质控规则', icon: Cpu, roles: ['admin'] },
      { path: '/quality/fraud', label: '造假识别', icon: Search, roles: ['admin', 'enforcer'] },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()
  const { sidebarCollapsed, toggleSidebar, currentRole } = useStore()

  const filteredGroups = navGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(currentRole)),
  })).filter((group) => group.items.length > 0)

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300',
        'bg-bg-secondary border-r border-border',
        sidebarCollapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className={cn(
        'flex items-center h-14 px-3 border-b border-border flex-shrink-0',
        sidebarCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-accent-green/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-accent-green" />
            </div>
            <span className="text-sm font-semibold text-txt-primary tracking-wide">污染源监控</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="w-6 h-6 rounded flex items-center justify-center text-txt-muted hover:text-txt-primary hover:bg-bg-card transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {filteredGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!sidebarCollapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-medium text-txt-muted uppercase tracking-widest">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-200 mb-0.5',
                    isActive
                      ? 'bg-accent-green-dim text-accent-green font-medium'
                      : 'text-txt-secondary hover:text-txt-primary hover:bg-bg-card'
                  )}
                >
                  <item.icon className={cn('w-4 h-4 flex-shrink-0', isActive && 'text-accent-green')} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {isActive && !sidebarCollapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-green" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3 flex-shrink-0">
        {!sidebarCollapsed && (
          <div className="text-[10px] text-txt-muted text-center">
            HJ212/HJ216 合规平台
          </div>
        )}
      </div>
    </aside>
  )
}
