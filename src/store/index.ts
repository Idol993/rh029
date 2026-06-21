import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole, WarningEvent, EnforcementTask, TaxRecord, MaintenanceOrder, FraudClue, EvidenceFile, TaxDeclaration } from '@/types'
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
  taxDeclarations: TaxDeclaration[]
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
  addEnforcementEvidence: (taskId: string, file: EvidenceFile) => void
  removeEnforcementEvidence: (taskId: string, fileId: string) => void
  createRectifyFromEnforcement: (taskId: string) => string
  setRectifyStep: (taskId: string, step: number) => void
  closeRectify: (taskId: string) => void
  generateDeclaration: (recordIds: string[]) => string
  confirmDeclaration: (declarationId: string) => void
  declareTax: (ids: string[]) => void
  approveQualityRecord: (id: string) => void
  rejectQualityRecord: (id: string) => void
  dispatchFraudClue: (id: string) => string
  startMaintenanceOrder: (id: string) => void
  completeMaintenanceOrder: (id: string) => void
  reviewMaintenanceOrder: (id: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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
      taxDeclarations: [],
      maintenanceOrders: [...mockData.maintenanceOrders],
      qualityRules: mockData.qualityRules,
      fraudClues: [...mockData.fraudClues],
      facilityStatuses: mockData.facilityStatuses,
      chartData: mockData.chartData,
      stats: mockData.stats,

      processWarning: (id, handler) => set((s) => ({
        warningEvents: s.warningEvents.map((w) =>
          w.id === id ? { ...w, status: 'processing' as const, handler, processTime: now() } : w
        ),
      })),

      resolveWarning: (id) => set((s) => ({
        warningEvents: s.warningEvents.map((w) =>
          w.id === id ? { ...w, status: 'resolved' as const, resolveTime: now() } : w
        ),
      })),

      closeWarning: (id) => set((s) => ({
        warningEvents: s.warningEvents.map((w) =>
          w.id === id ? { ...w, status: 'closed' as const, closeTime: now() } : w
        ),
      })),

      createEnforcementFromWarning: (warningId, enforcerName) => {
        const warning = get().warningEvents.find((w) => w.id === warningId)
        if (!warning) return ''
        const newId = genId('f')
        const t = now()
        const task: EnforcementTask = {
          id: newId,
          warningId,
          enterpriseName: warning.enterpriseName,
          outletCode: warning.outletCode,
          enforcerName,
          type: 'check',
          typeName: '现场检查',
          status: 'assigned',
          assignTime: t,
          description: `${warning.typeName}现场核查 - ${warning.description}`,
          evidenceFiles: [],
          rectifyStep: 0,
          rectifyStepTimes: [t],
        }
        set((s) => ({
          enforcementTasks: [...s.enforcementTasks, task],
          warningEvents: s.warningEvents.map((w) =>
            w.id === warningId ? { ...w, status: 'dispatched' as const, handler: enforcerName, dispatchTime: now() } : w
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

      addEnforcementEvidence: (taskId, file) => set((s) => ({
        enforcementTasks: s.enforcementTasks.map((t) =>
          t.id === taskId ? { ...t, evidenceFiles: [...t.evidenceFiles, file] } : t
        ),
      })),

      removeEnforcementEvidence: (taskId, fileId) => set((s) => ({
        enforcementTasks: s.enforcementTasks.map((t) =>
          t.id === taskId ? { ...t, evidenceFiles: t.evidenceFiles.filter(f => f.id !== fileId) } : t
        ),
      })),

      createRectifyFromEnforcement: (taskId) => {
        const task = get().enforcementTasks.find((t) => t.id === taskId)
        if (!task) return ''
        const newId = genId('f')
        const t = now()
        const rectify: EnforcementTask = {
          id: newId,
          warningId: task.warningId,
          enterpriseName: task.enterpriseName,
          outletCode: task.outletCode,
          enforcerName: task.enforcerName,
          type: 'rectify',
          typeName: '整改督办',
          status: 'assigned',
          assignTime: t,
          description: `${task.enterpriseName}整改督办 - 源自执法任务${task.id}`,
          evidenceFiles: [...task.evidenceFiles],
          rectifyStep: 0,
          rectifyStepTimes: [t],
        }
        set((s) => ({
          enforcementTasks: [...s.enforcementTasks, rectify],
        }))
        return newId
      },

      setRectifyStep: (taskId, step) => set((s) => ({
        enforcementTasks: s.enforcementTasks.map((t) => {
          if (t.id !== taskId) return t
          const times = [...t.rectifyStepTimes]
          while (times.length <= step) times.push('')
          times[step] = now()
          return { ...t, rectifyStep: step, rectifyStepTimes: times }
        }),
      })),

      closeRectify: (taskId) => set((s) => ({
        enforcementTasks: s.enforcementTasks.map((t) => {
          if (t.id !== taskId) return t
          const times = [...t.rectifyStepTimes]
          while (times.length <= 4) times.push('')
          times[4] = now()
          return { ...t, status: 'closed' as const, rectifyStep: 4, completeTime: t.completeTime || now(), rectifyStepTimes: times }
        }),
      })),

      generateDeclaration: (recordIds) => {
        const records = get().taxRecords.filter(r => recordIds.includes(r.id) && r.status === 'calculated')
        if (records.length === 0) return ''
        const declId = genId('decl')
        const enterpriseMap = new Map<string, { totalTax: number; pollutantCount: number }>()
        records.forEach(r => {
          const existing = enterpriseMap.get(r.enterpriseName)
          if (existing) {
            existing.totalTax += r.taxAmount
            existing.pollutantCount++
          } else {
            enterpriseMap.set(r.enterpriseName, { totalTax: r.taxAmount, pollutantCount: 1 })
          }
        })
        const declaration: TaxDeclaration = {
          id: declId,
          period: records[0].period,
          createdAt: now(),
          status: 'preview',
          records: recordIds,
          enterpriseSummary: Array.from(enterpriseMap.entries()).map(([name, data]) => ({
            name,
            totalTax: Math.round(data.totalTax * 100) / 100,
            pollutantCount: data.pollutantCount,
          })),
          totalTax: Math.round(records.reduce((s, r) => s + r.taxAmount, 0) * 100) / 100,
        }
        set((s) => ({
          taxDeclarations: [...s.taxDeclarations, declaration],
        }))
        return declId
      },

      confirmDeclaration: (declarationId) => {
        const decl = get().taxDeclarations.find(d => d.id === declarationId)
        if (!decl || decl.status !== 'preview') return
        const confirmedAt = now()
        set((s) => ({
          taxDeclarations: s.taxDeclarations.map(d =>
            d.id === declarationId ? { ...d, status: 'confirmed' as const, confirmedAt } : d
          ),
          taxRecords: s.taxRecords.map(r =>
            decl.records.includes(r.id) && r.status === 'calculated'
              ? { ...r, status: 'declared' as const, declaredAt: confirmedAt, declarationId }
              : r
          ),
        }))
      },

      declareTax: (ids) => {
        const confirmedAt = now()
        set((s) => ({
          taxRecords: s.taxRecords.map((r) =>
            ids.includes(r.id) && r.status === 'calculated'
              ? { ...r, status: 'declared' as const, declaredAt: confirmedAt }
              : r
          ),
        }))
      },

      approveQualityRecord: (_id) => set((s) => s),
      rejectQualityRecord: (_id) => set((s) => s),

      dispatchFraudClue: (id) => {
        const clue = get().fraudClues.find((c) => c.id === id)
        if (!clue) return ''
        const newId = genId('f')
        const t = now()
        const task: EnforcementTask = {
          id: newId,
          warningId: '',
          enterpriseName: clue.enterpriseName,
          outletCode: clue.deviceCode,
          enforcerName: '王执法',
          type: 'check',
          typeName: '现场检查',
          status: 'assigned',
          assignTime: t,
          description: `疑似数据造假现场核查 - ${clue.description}`,
          evidenceFiles: [],
          rectifyStep: 0,
          rectifyStepTimes: [t],
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
    }),
    {
      name: 'env-monitor-store',
      partialize: (state) => ({
        warningEvents: state.warningEvents,
        enforcementTasks: state.enforcementTasks,
        taxRecords: state.taxRecords,
        taxDeclarations: state.taxDeclarations,
        maintenanceOrders: state.maintenanceOrders,
        fraudClues: state.fraudClues,
        currentRole: state.currentRole,
      }),
    }
  )
)
