import { create } from 'zustand'
import type { UserRole } from '@/types'
import { mockData } from '@/data/mockData'

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
  warningEvents: typeof mockData.warningEvents
  enforcementTasks: typeof mockData.enforcementTasks
  taxRecords: typeof mockData.taxRecords
  maintenanceOrders: typeof mockData.maintenanceOrders
  qualityRules: typeof mockData.qualityRules
  fraudClues: typeof mockData.fraudClues
  facilityStatuses: typeof mockData.facilityStatuses
  chartData: typeof mockData.chartData
  stats: typeof mockData.stats
}

export const useStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  currentRole: 'admin',
  currentPage: '/dashboard',
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setRole: (role) => set({ currentRole: role }),
  setCurrentPage: (page) => set({ currentPage: page }),
  enterprises: mockData.enterprises,
  outlets: mockData.outlets,
  devices: mockData.devices,
  warningEvents: mockData.warningEvents,
  enforcementTasks: mockData.enforcementTasks,
  taxRecords: mockData.taxRecords,
  maintenanceOrders: mockData.maintenanceOrders,
  qualityRules: mockData.qualityRules,
  fraudClues: mockData.fraudClues,
  facilityStatuses: mockData.facilityStatuses,
  chartData: mockData.chartData,
  stats: mockData.stats,
}))
