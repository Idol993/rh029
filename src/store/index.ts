import { create } from 'zustand'
import type { UserRole, WarningEvent, EnforcementTask, TaxRecord, MaintenanceOrder, FraudClue } from '@/types'
import { mockData } from '@/data/mockData'

let nextId = 1000
function genId(prefix: string) {
  return `${prefix}${++nextId}`
}
function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

interface AppState {
  sidebarCollapsed: boolean
  currentRole: UserRole
  currentPage: string
  toggleSidebar: () => void
  setRole: (role: UserRole) => void
  setCurrentPage: (page: string) => void
  enterprises: typeof mockData.enterprises
  outlets: typeof mockData.outlets
  devices: typeof mockData.devices
  warningEvents: WarningEvent[]
  enforcementTasks: EnforcementTask[]
  taxRecords: TaxRecord[]
  maintenanceOrders: MaintenanceOrder[]
  qualityRules: typeof mockData.qualityRules
  fraudClues: FraudClue[]
  facilityStatuses: typeof mockData.facilityStatuses
  chartData: typeof mockData.chartData
  stats: typeof mockData.stats

  processWarning: (id: string, handler: string) => void
  resolveWarning: (id: string) => void
  closeWarning: (id: string) => void
  createEnforcementFromWarning: (warningId: string, enforcerName: string) => string
  startEnforcement: (id: string) => void
  completeEnforcement: (id: string) => void
  createRectifyFromEnforcement: (taskId: string) => string
  declareTax: (ids: string[]) => void
  approveQualityRecord: (id: string) => void
  rejectQualityRecord: (id: string) => void
  dispatchFraudClue: (id: string) => string
  startMaintenanceOrder: (id: string) => void
  completeMaintenanceOrder: (id: string) => void
  reviewMaintenanceOrder: (id: string) => void
}

export const useStore = create<AppState>((set, get) => ({
  sidebarCollapsed: false,
  currentRole: 'admin',
  currentPage: '/dashboard',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setRole: (role) => set({ currentRole: role }),
  setCurrentPage: (page) => set({ currentPage: page }),
  enterprises: mockData.enterprises,
  outlets: mockData.outlets,
  devices: mockData.devices,
  warningEvents: [...mockData.warningEvents],
  enforcementTasks: [...mockData.enforcementTasks],
  taxRecords: [...mockData.taxRecords],
  maintenanceOrders: [...mockData.maintenanceOrders],
  qualityRules: mockData.qualityRules,
  fraudClues: [...mockData.fraudClues],
  facilityStatuses: mockData.facilityStatuses,
  chartData: mockData.chartData,
  stats: mockData.stats,

  processWarning: (id, handler) => set((s) => ({
    warningEvents: s.warningEvents.map((w) =>
      w.id === id ? { ...w, status: 'processing' as const, handler } : w
    ),
  })),

  resolveWarning: (id) => set((s) => ({
    warningEvents: s.warningEvents.map((w) =>
      w.id === id ? { ...w, status: 'resolved' as const } : w
    ),
  })),

  closeWarning: (id) => set((s) => ({
    warningEvents: s.warningEvents.map((w) =>
      w.id === id ? { ...w, status: 'closed' as const } : w
    ),
  })),

  createEnforcementFromWarning: (warningId, enforcerName) => {
    const warning = get().warningEvents.find((w) => w.id === warningId)
    if (!warning) return ''
    const newId = genId('f')
    const task: EnforcementTask = {
      id: newId,
      warningId,
      enterpriseName: warning.enterpriseName,
      outletCode: warning.outletCode,
      enforcerName,
      type: 'check',
      typeName: '现场检查',
      status: 'assigned',
      assignTime: now(),
      description: `${warning.typeName}现场核查 - ${warning.description}`,
    }
    set((s) => ({
      enforcementTasks: [...s.enforcementTasks, task],
      warningEvents: s.warningEvents.map((w) =>
        w.id === warningId ? { ...w, status: 'dispatched' as const, handler: enforcerName } : w
      ),
    }))
    return newId
  },

  startEnforcement: (id) => set((s) => ({
    enforcementTasks: s.enforcementTasks.map((t) =>
      t.id === id ? { ...t, status: 'in_progress' as const } : t
    ),
  })),

  completeEnforcement: (id) => set((s) => ({
    enforcementTasks: s.enforcementTasks.map((t) =>
      t.id === id ? { ...t, status: 'completed' as const, completeTime: now() } : t
    ),
  })),

  createRectifyFromEnforcement: (taskId) => {
    const task = get().enforcementTasks.find((t) => t.id === taskId)
    if (!task) return ''
    const newId = genId('f')
    const rectify: EnforcementTask = {
      id: newId,
      warningId: task.warningId,
      enterpriseName: task.enterpriseName,
      outletCode: task.outletCode,
      enforcerName: task.enforcerName,
      type: 'rectify',
      typeName: '整改督办',
      status: 'assigned',
      assignTime: now(),
      description: `${task.enterpriseName}整改督办 - 源自执法任务${task.id}`,
    }
    set((s) => ({
      enforcementTasks: [...s.enforcementTasks, rectify],
    }))
    return newId
  },

  declareTax: (ids) => set((s) => ({
    taxRecords: s.taxRecords.map((r) =>
      ids.includes(r.id) && r.status === 'calculated'
        ? { ...r, status: 'declared' as const }
        : r
    ),
  })),

  approveQualityRecord: (_id) => set((s) => s),
  rejectQualityRecord: (_id) => set((s) => s),

  dispatchFraudClue: (id) => {
    const clue = get().fraudClues.find((c) => c.id === id)
    if (!clue) return ''
    const newId = genId('f')
    const task: EnforcementTask = {
      id: newId,
      warningId: '',
      enterpriseName: clue.enterpriseName,
      outletCode: clue.deviceCode,
      enforcerName: '王执法',
      type: 'check',
      typeName: '现场检查',
      status: 'assigned',
      assignTime: now(),
      description: `疑似数据造假现场核查 - ${clue.description}`,
    }
    set((s) => ({
      fraudClues: s.fraudClues.map((c) =>
        c.id === id ? { ...c, status: 'dispatched' as const } : c
      ),
      enforcementTasks: [...s.enforcementTasks, task],
    }))
    return newId
  },

  startMaintenanceOrder: (id) => set((s) => ({
    maintenanceOrders: s.maintenanceOrders.map((o) =>
      o.id === id ? { ...o, status: 'in_progress' as const } : o
    ),
  })),

  completeMaintenanceOrder: (id) => set((s) => ({
    maintenanceOrders: s.maintenanceOrders.map((o) =>
      o.id === id ? { ...o, status: 'completed' as const, completeTime: now() } : o
    ),
  })),

  reviewMaintenanceOrder: (id) => set((s) => ({
    maintenanceOrders: s.maintenanceOrders.map((o) =>
      o.id === id ? { ...o, status: 'reviewed' as const } : o
    ),
  })),
}))
