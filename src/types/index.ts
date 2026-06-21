export interface Enterprise {
  id: string
  name: string
  industryType: string
  contact: string
  phone: string
  status: 'normal' | 'warning' | 'offline'
  location: string
}

export interface Outlet {
  id: string
  enterpriseId: string
  enterpriseName: string
  code: string
  emissionType: 'water' | 'gas'
  location: string
  dischargeDest: string
  treatmentProcess: string
  permitLimits: Record<string, number>
  status: 'online' | 'offline' | 'maintenance'
}

export interface Device {
  id: string
  outletId: string
  outletCode: string
  enterpriseName: string
  deviceCode: string
  model: string
  range: string
  maintenanceUnit: string
  calibrationExpiry: string
  installLocation: string
  status: 'online' | 'offline' | 'fault' | 'maintenance'
  pollutants: string[]
}

export interface MonitorData {
  id: string
  deviceId: string
  outletId: string
  pollutantCode: string
  pollutantName: string
  value: number
  unit: string
  limit: number
  timestamp: string
  qualityFlag: 'valid' | 'invalid' | 'suspect'
}

export type WarningLevel = 'red' | 'orange' | 'yellow'

export interface EvidenceFile {
  id: string
  name: string
  type: 'photo' | 'video'
  size: string
  uploadedAt: string
}

export interface WarningEvent {
  id: string
  outletId: string
  outletCode: string
  enterpriseName: string
  level: WarningLevel
  type: 'exceed' | 'facility_stop' | 'data_anomaly' | 'fraud_suspect'
  typeName: string
  pollutantName: string
  exceedValue: number
  limitValue: number
  unit: string
  triggerTime: string
  status: 'pending' | 'processing' | 'resolved' | 'closed' | 'dispatched'
  handler?: string
  description: string
  processTime?: string
  dispatchTime?: string
  resolveTime?: string
  closeTime?: string
}

export interface EnforcementTask {
  id: string
  warningId: string
  enterpriseName: string
  outletCode: string
  enforcerName: string
  type: 'check' | 'rectify' | 'penalty' | 'review'
  typeName: string
  status: 'assigned' | 'in_progress' | 'completed' | 'closed'
  assignTime: string
  completeTime?: string
  description: string
  evidenceFiles: EvidenceFile[]
  rectifyStep: number
}

export interface TaxRecord {
  id: string
  enterpriseId: string
  enterpriseName: string
  period: string
  pollutantType: string
  emission: number
  equivalentValue: number
  unitPrice: number
  taxAmount: number
  status: 'calculated' | 'declared' | 'paid'
  declaredAt?: string
  declarationId?: string
}

export interface TaxDeclaration {
  id: string
  period: string
  createdAt: string
  confirmedAt?: string
  status: 'preview' | 'confirmed'
  records: string[]
  enterpriseSummary: { name: string; totalTax: number; pollutantCount: number }[]
  totalTax: number
}

export interface MaintenanceOrder {
  id: string
  deviceId: string
  deviceCode: string
  enterpriseName: string
  type: 'fault' | 'calibration' | 'maintenance' | 'inspection'
  typeName: string
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed'
  operator: string
  createTime: string
  completeTime?: string
  description: string
}

export interface QualityRule {
  id: string
  name: string
  type: 'overrange' | 'zero_drift' | 'full_drift' | 'data_gap' | 'constant' | 'mutation'
  typeName: string
  description: string
  threshold: string
  enabled: boolean
}

export interface FraudClue {
  id: string
  deviceId: string
  deviceCode: string
  enterpriseName: string
  type: 'constant_data' | 'mutation_jump' | 'reverse_logic' | 'offline_anomaly' | 'flow_anomaly'
  typeName: string
  confidence: number
  detectTime: string
  status: 'detected' | 'dispatched' | 'verified' | 'dismissed'
  description: string
}

export type UserRole = 'enterprise' | 'maintenance' | 'enforcer' | 'admin'

export interface FacilityStatus {
  id: string
  enterpriseId: string
  enterpriseName: string
  fanRunning: boolean
  pumpRunning: boolean
  dosingRunning: boolean
  voltage: number
  sampleFlow: number
  productionOnline: boolean
  timestamp: string
}
