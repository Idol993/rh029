import type {
  Enterprise, Outlet, Device, MonitorData, WarningEvent,
  EnforcementTask, TaxRecord, MaintenanceOrder, QualityRule, FraudClue, FacilityStatus
} from '@/types'

const enterprises: Enterprise[] = [
  { id: 'e1', name: '华泰化工有限公司', industryType: '化工', contact: '张明', phone: '138****1234', status: 'warning', location: 'A区3号' },
  { id: 'e2', name: '鑫源印染集团', industryType: '印染', contact: '李华', phone: '139****5678', status: 'normal', location: 'B区7号' },
  { id: 'e3', name: '恒通钢铁厂', industryType: '钢铁', contact: '王强', phone: '137****9012', status: 'normal', location: 'C区1号' },
  { id: 'e4', name: '绿洲纸业有限公司', industryType: '造纸', contact: '赵丽', phone: '136****3456', status: 'warning', location: 'A区5号' },
  { id: 'e5', name: '鼎盛电镀厂', industryType: '电镀', contact: '刘伟', phone: '135****7890', status: 'offline', location: 'D区2号' },
  { id: 'e6', name: '天成制药有限公司', industryType: '制药', contact: '陈芳', phone: '133****2345', status: 'normal', location: 'B区3号' },
  { id: 'e7', name: '宏达食品加工厂', industryType: '食品', contact: '杨光', phone: '131****6789', status: 'normal', location: 'C区8号' },
  { id: 'e8', name: '永利建材有限公司', industryType: '建材', contact: '吴敏', phone: '130****0123', status: 'warning', location: 'D区6号' },
]

const outlets: Outlet[] = [
  { id: 'o1', enterpriseId: 'e1', enterpriseName: '华泰化工有限公司', code: 'WS-E1-001', emissionType: 'water', location: 'A区3号排口', dischargeDest: '园区污水处理厂', treatmentProcess: '物化+生化', permitLimits: { COD: 80, NH3N: 8, TP: 1.0, TN: 15 }, status: 'online' },
  { id: 'o2', enterpriseId: 'e1', enterpriseName: '华泰化工有限公司', code: 'GAS-E1-001', emissionType: 'gas', location: 'A区3号烟囱', dischargeDest: '大气', treatmentProcess: '碱洗+RTO', permitLimits: { SO2: 50, NOx: 100, VOCs: 20 }, status: 'online' },
  { id: 'o3', enterpriseId: 'e2', enterpriseName: '鑫源印染集团', code: 'WS-E2-001', emissionType: 'water', location: 'B区7号排口', dischargeDest: '园区污水处理厂', treatmentProcess: '生化+深度处理', permitLimits: { COD: 100, NH3N: 10, TP: 1.5, TN: 20 }, status: 'online' },
  { id: 'o4', enterpriseId: 'e3', enterpriseName: '恒通钢铁厂', code: 'GAS-E3-001', emissionType: 'gas', location: 'C区1号烟囱', dischargeDest: '大气', treatmentProcess: '脱硫脱硝+除尘', permitLimits: { SO2: 100, NOx: 150, Dust: 30 }, status: 'online' },
  { id: 'o5', enterpriseId: 'e4', enterpriseName: '绿洲纸业有限公司', code: 'WS-E4-001', emissionType: 'water', location: 'A区5号排口', dischargeDest: '园区污水处理厂', treatmentProcess: '物化+生化+深度', permitLimits: { COD: 90, NH3N: 8, TP: 1.0, TN: 15 }, status: 'online' },
  { id: 'o6', enterpriseId: 'e5', enterpriseName: '鼎盛电镀厂', code: 'WS-E5-001', emissionType: 'water', location: 'D区2号排口', dischargeDest: '园区污水处理厂', treatmentProcess: '化学沉淀+离子交换', permitLimits: { COD: 60, NH3N: 5, TP: 0.5, TN: 10 }, status: 'offline' },
  { id: 'o7', enterpriseId: 'e6', enterpriseName: '天成制药有限公司', code: 'WS-E6-001', emissionType: 'water', location: 'B区3号排口', dischargeDest: '园区污水处理厂', treatmentProcess: '生化+臭氧', permitLimits: { COD: 70, NH3N: 6, TP: 0.8, TN: 12 }, status: 'online' },
  { id: 'o8', enterpriseId: 'e7', enterpriseName: '宏达食品加工厂', code: 'WS-E7-001', emissionType: 'water', location: 'C区8号排口', dischargeDest: '园区污水处理厂', treatmentProcess: '厌氧+好氧', permitLimits: { COD: 80, NH3N: 8, TP: 1.0, TN: 15 }, status: 'online' },
  { id: 'o9', enterpriseId: 'e8', enterpriseName: '永利建材有限公司', code: 'GAS-E8-001', emissionType: 'gas', location: 'D区6号烟囱', dischargeDest: '大气', treatmentProcess: '袋式除尘+脱硫', permitLimits: { SO2: 80, NOx: 120, Dust: 20 }, status: 'online' },
]

const devices: Device[] = [
  { id: 'd1', outletId: 'o1', outletCode: 'WS-E1-001', enterpriseName: '华泰化工', deviceCode: 'DEV-W-001', model: 'HB-COD2000', range: '0-500mg/L', maintenanceUnit: '瑞达运维', calibrationExpiry: '2026-09-15', installLocation: '排口1号站房', status: 'online', pollutants: ['COD', 'NH3N', 'TP', 'TN', 'pH'] },
  { id: 'd2', outletId: 'o2', outletCode: 'GAS-E1-001', enterpriseName: '华泰化工', deviceCode: 'DEV-G-001', model: 'HB-GAS3000', range: '0-200mg/m³', maintenanceUnit: '瑞达运维', calibrationExpiry: '2026-08-20', installLocation: '烟囱1号站房', status: 'online', pollutants: ['SO2', 'NOx', 'VOCs', 'O2'] },
  { id: 'd3', outletId: 'o3', outletCode: 'WS-E2-001', enterpriseName: '鑫源印染', deviceCode: 'DEV-W-002', model: 'HB-COD2000', range: '0-500mg/L', maintenanceUnit: '中科运维', calibrationExpiry: '2026-10-10', installLocation: '排口2号站房', status: 'online', pollutants: ['COD', 'NH3N', 'TP', 'TN'] },
  { id: 'd4', outletId: 'o4', outletCode: 'GAS-E3-001', enterpriseName: '恒通钢铁', deviceCode: 'DEV-G-002', model: 'HB-GAS3000', range: '0-300mg/m³', maintenanceUnit: '中科运维', calibrationExpiry: '2026-07-30', installLocation: '烟囱2号站房', status: 'online', pollutants: ['SO2', 'NOx', 'Dust'] },
  { id: 'd5', outletId: 'o5', outletCode: 'WS-E4-001', enterpriseName: '绿洲纸业', deviceCode: 'DEV-W-003', model: 'HB-COD2000', range: '0-500mg/L', maintenanceUnit: '瑞达运维', calibrationExpiry: '2026-06-25', installLocation: '排口3号站房', status: 'fault', pollutants: ['COD', 'NH3N', 'TP'] },
  { id: 'd6', outletId: 'o6', outletCode: 'WS-E5-001', enterpriseName: '鼎盛电镀', deviceCode: 'DEV-W-004', model: 'HB-COD2000', range: '0-300mg/L', maintenanceUnit: '中科运维', calibrationExpiry: '2026-11-05', installLocation: '排口4号站房', status: 'offline', pollutants: ['COD', 'NH3N', 'TP', 'TN'] },
  { id: 'd7', outletId: 'o7', outletCode: 'WS-E6-001', enterpriseName: '天成制药', deviceCode: 'DEV-W-005', model: 'HB-COD2000', range: '0-500mg/L', maintenanceUnit: '瑞达运维', calibrationExpiry: '2026-12-01', installLocation: '排口5号站房', status: 'online', pollutants: ['COD', 'NH3N', 'TP', 'TN'] },
  { id: 'd8', outletId: 'o9', outletCode: 'GAS-E8-001', enterpriseName: '永利建材', deviceCode: 'DEV-G-003', model: 'HB-GAS3000', range: '0-200mg/m³', maintenanceUnit: '中科运维', calibrationExpiry: '2026-08-15', installLocation: '烟囱3号站房', status: 'online', pollutants: ['SO2', 'NOx', 'Dust'] },
]

function genTimeSeries(hours: number, base: number, variance: number, unit: string = ''): MonitorData[] {
  const now = new Date()
  const data: MonitorData[] = []
  for (let i = hours; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000)
    const v = base + (Math.random() - 0.4) * variance
    data.push({
      id: `md-${hours}-${i}`,
      deviceId: 'd1',
      outletId: 'o1',
      pollutantCode: 'COD',
      pollutantName: 'COD',
      value: Math.round(v * 100) / 100,
      unit,
      limit: base * 1.2,
      timestamp: t.toISOString(),
      qualityFlag: Math.random() > 0.05 ? 'valid' : 'suspect',
    })
  }
  return data
}

const warningEvents: WarningEvent[] = [
  { id: 'w1', outletId: 'o1', outletCode: 'WS-E1-001', enterpriseName: '华泰化工有限公司', level: 'red', type: 'exceed', typeName: '浓度超标', pollutantName: 'COD', exceedValue: 98.5, limitValue: 80, unit: 'mg/L', triggerTime: '2026-06-21 08:15:00', status: 'pending', description: 'COD浓度持续超标，小时均值98.5mg/L，超限值23.1%' },
  { id: 'w2', outletId: 'o2', outletCode: 'GAS-E1-001', enterpriseName: '华泰化工有限公司', level: 'orange', type: 'exceed', typeName: '浓度超标', pollutantName: 'VOCs', exceedValue: 24.8, limitValue: 20, unit: 'mg/m³', triggerTime: '2026-06-21 07:30:00', status: 'processing', handler: '王执法', processTime: '2026-06-21 07:35:00', description: 'VOCs小时均值超标，达24.8mg/m³' },
  { id: 'w3', outletId: 'o3', outletCode: 'WS-E2-001', enterpriseName: '鑫源印染集团', level: 'yellow', type: 'facility_stop', typeName: '设施停运', pollutantName: '-', exceedValue: 0, limitValue: 0, unit: '', triggerTime: '2026-06-21 06:45:00', status: 'resolved', handler: '李执法', processTime: '2026-06-21 06:50:00', resolveTime: '2026-06-21 10:30:00', description: '生产在线但治污设施加药泵停运，已恢复' },
  { id: 'w4', outletId: 'o5', outletCode: 'WS-E4-001', enterpriseName: '绿洲纸业有限公司', level: 'red', type: 'exceed', typeName: '浓度超标', pollutantName: 'COD', exceedValue: 112.3, limitValue: 90, unit: 'mg/L', triggerTime: '2026-06-21 05:20:00', status: 'pending', description: 'COD严重超标，日均值112.3mg/L，超限值24.8%' },
  { id: 'w5', outletId: 'o1', outletCode: 'WS-E1-001', enterpriseName: '华泰化工有限公司', level: 'orange', type: 'data_anomaly', typeName: '数据异常', pollutantName: 'pH', exceedValue: 10.2, limitValue: 9, unit: '', triggerTime: '2026-06-21 04:10:00', status: 'processing', handler: '张执法', processTime: '2026-06-21 04:15:00', description: 'pH值异常偏高，疑似排放碱性废水' },
  { id: 'w6', outletId: 'o4', outletCode: 'GAS-E3-001', enterpriseName: '恒通钢铁厂', level: 'yellow', type: 'fraud_suspect', typeName: '疑似造假', pollutantName: 'SO₂', exceedValue: 0, limitValue: 100, unit: 'mg/m³', triggerTime: '2026-06-20 22:00:00', status: 'dispatched', handler: '赵执法', processTime: '2026-06-20 22:05:00', dispatchTime: '2026-06-20 22:10:00', description: 'SO₂数据长时间恒定在5mg/m³，与生产工况不符' },
  { id: 'w7', outletId: 'o9', outletCode: 'GAS-E8-001', enterpriseName: '永利建材有限公司', level: 'orange', type: 'exceed', typeName: '浓度超标', pollutantName: 'Dust', exceedValue: 28.5, limitValue: 20, unit: 'mg/m³', triggerTime: '2026-06-21 09:00:00', status: 'pending', description: '烟尘浓度超标，小时均值28.5mg/m³' },
  { id: 'w8', outletId: 'o7', outletCode: 'WS-E6-001', enterpriseName: '天成制药有限公司', level: 'yellow', type: 'facility_stop', typeName: '设施停运', pollutantName: '-', exceedValue: 0, limitValue: 0, unit: '', triggerTime: '2026-06-21 03:30:00', status: 'resolved', handler: '赵执法', processTime: '2026-06-21 03:35:00', resolveTime: '2026-06-21 05:30:00', description: '生化池曝气风机停运2小时，已恢复' },
]

const enforcementTasks: EnforcementTask[] = [
  { id: 'f1', warningId: 'w1', enterpriseName: '华泰化工有限公司', outletCode: 'WS-E1-001', enforcerName: '王执法', type: 'check', typeName: '现场检查', status: 'assigned', assignTime: '2026-06-21 08:20:00', description: 'COD超标现场核查', evidenceFiles: [], rectifyStep: 0, rectifyStepTimes: ['2026-06-21 08:20:00'], rectifyFiles: [] },
  { id: 'f2', warningId: 'w2', enterpriseName: '华泰化工有限公司', outletCode: 'GAS-E1-001', enforcerName: '李执法', type: 'check', typeName: '现场检查', status: 'in_progress', assignTime: '2026-06-21 07:35:00', description: 'VOCs超标现场检查', evidenceFiles: [], rectifyStep: 0, rectifyStepTimes: ['2026-06-21 07:35:00'], rectifyFiles: [] },
  { id: 'f3', warningId: 'w4', enterpriseName: '绿洲纸业有限公司', outletCode: 'WS-E4-001', enforcerName: '张执法', type: 'rectify', typeName: '整改督办', status: 'assigned', assignTime: '2026-06-21 05:25:00', description: 'COD严重超标整改', evidenceFiles: [], rectifyStep: 0, rectifyStepTimes: ['2026-06-21 05:25:00'], rectifyFiles: [] },
  { id: 'f4', warningId: 'w3', enterpriseName: '鑫源印染集团', outletCode: 'WS-E2-001', enforcerName: '李执法', type: 'review', typeName: '复核销号', status: 'completed', assignTime: '2026-06-21 06:50:00', completeTime: '2026-06-21 10:30:00', description: '设施停运核查已完成', evidenceFiles: [], rectifyStep: 3, rectifyStepTimes: ['2026-06-21 06:50:00', '2026-06-21 07:00:00', '2026-06-21 10:00:00', '2026-06-21 10:30:00'], rectifyFiles: [] },
  { id: 'f5', warningId: 'w6', enterpriseName: '恒通钢铁厂', outletCode: 'GAS-E3-001', enforcerName: '赵执法', type: 'check', typeName: '现场检查', status: 'in_progress', assignTime: '2026-06-20 22:05:00', description: '疑似数据造假现场核查', evidenceFiles: [], rectifyStep: 0, rectifyStepTimes: ['2026-06-20 22:05:00'], rectifyFiles: [] },
  { id: 'f6', warningId: 'w7', enterpriseName: '永利建材有限公司', outletCode: 'GAS-E8-001', enforcerName: '王执法', type: 'rectify', typeName: '整改督办', status: 'assigned', assignTime: '2026-06-21 09:05:00', description: '烟尘超标整改', evidenceFiles: [], rectifyStep: 0, rectifyStepTimes: ['2026-06-21 09:05:00'], rectifyFiles: [] },
]

const taxRecords: TaxRecord[] = [
  { id: 't1', enterpriseId: 'e1', enterpriseName: '华泰化工有限公司', period: '2026-05', pollutantType: 'COD', emission: 2450, equivalentValue: 2450, unitPrice: 1.4, taxAmount: 3430, status: 'paid' },
  { id: 't2', enterpriseId: 'e1', enterpriseName: '华泰化工有限公司', period: '2026-05', pollutantType: 'NH3N', emission: 320, equivalentValue: 3200, unitPrice: 1.4, taxAmount: 4480, status: 'paid' },
  { id: 't3', enterpriseId: 'e2', enterpriseName: '鑫源印染集团', period: '2026-05', pollutantType: 'COD', emission: 3200, equivalentValue: 3200, unitPrice: 1.4, taxAmount: 4480, status: 'declared' },
  { id: 't4', enterpriseId: 'e2', enterpriseName: '鑫源印染集团', period: '2026-05', pollutantType: 'NH3N', emission: 450, equivalentValue: 4500, unitPrice: 1.4, taxAmount: 6300, status: 'declared' },
  { id: 't5', enterpriseId: 'e3', enterpriseName: '恒通钢铁厂', period: '2026-05', pollutantType: 'SO2', emission: 8500, equivalentValue: 944.4, unitPrice: 1.2, taxAmount: 1133.28, status: 'calculated' },
  { id: 't6', enterpriseId: 'e3', enterpriseName: '恒通钢铁厂', period: '2026-05', pollutantType: 'NOx', emission: 12000, equivalentValue: 1200, unitPrice: 1.2, taxAmount: 1440, status: 'calculated' },
  { id: 't7', enterpriseId: 'e4', enterpriseName: '绿洲纸业有限公司', period: '2026-05', pollutantType: 'COD', emission: 1800, equivalentValue: 1800, unitPrice: 1.4, taxAmount: 2520, status: 'paid' },
  { id: 't8', enterpriseId: 'e5', enterpriseName: '鼎盛电镀厂', period: '2026-05', pollutantType: 'COD', emission: 980, equivalentValue: 980, unitPrice: 1.4, taxAmount: 1372, status: 'calculated' },
  { id: 't9', enterpriseId: 'e6', enterpriseName: '天成制药有限公司', period: '2026-05', pollutantType: 'COD', emission: 1500, equivalentValue: 1500, unitPrice: 1.4, taxAmount: 2100, status: 'declared' },
  { id: 't10', enterpriseId: 'e8', enterpriseName: '永利建材有限公司', period: '2026-05', pollutantType: 'SO2', emission: 5200, equivalentValue: 577.8, unitPrice: 1.2, taxAmount: 693.36, status: 'calculated' },
]

const maintenanceOrders: MaintenanceOrder[] = [
  { id: 'm1', deviceId: 'd5', deviceCode: 'DEV-W-003', enterpriseName: '绿洲纸业', type: 'fault', typeName: '故障维修', status: 'in_progress', operator: '张工', createTime: '2026-06-21 05:30:00', description: 'COD分析仪数据异常，疑似探头故障' },
  { id: 'm2', deviceId: 'd2', deviceCode: 'DEV-G-001', enterpriseName: '华泰化工', type: 'calibration', typeName: '设备校准', status: 'pending', operator: '李工', createTime: '2026-06-21 09:00:00', description: 'VOCs检测仪定期校准' },
  { id: 'm3', deviceId: 'd4', deviceCode: 'DEV-G-002', enterpriseName: '恒通钢铁', type: 'maintenance', typeName: '日常维护', status: 'completed', operator: '王工', createTime: '2026-06-20 14:00:00', completeTime: '2026-06-20 17:30:00', description: '烟尘仪清灰维护' },
  { id: 'm4', deviceId: 'd6', deviceCode: 'DEV-W-004', enterpriseName: '鼎盛电镀', type: 'fault', typeName: '故障维修', status: 'pending', operator: '赵工', createTime: '2026-06-21 08:00:00', description: '设备离线，通信模块故障' },
  { id: 'm5', deviceId: 'd1', deviceCode: 'DEV-W-001', enterpriseName: '华泰化工', type: 'inspection', typeName: '设备巡检', status: 'reviewed', operator: '张工', createTime: '2026-06-19 10:00:00', completeTime: '2026-06-19 12:00:00', description: '季度常规巡检，数据正常' },
  { id: 'm6', deviceId: 'd3', deviceCode: 'DEV-W-002', enterpriseName: '鑫源印染', type: 'calibration', typeName: '设备校准', status: 'in_progress', operator: '李工', createTime: '2026-06-21 07:00:00', description: '氨氮分析仪标液校准' },
]

const qualityRules: QualityRule[] = [
  { id: 'qr1', name: '超量程检测', type: 'overrange', typeName: '超量程', description: '监测值超出设备量程范围时标记无效', threshold: '量程±5%', enabled: true },
  { id: 'qr2', name: '零点漂移检测', type: 'zero_drift', typeName: '零漂', description: '零点漂移超过允许值时触发质控', threshold: '±2%FS', enabled: true },
  { id: 'qr3', name: '满度漂移检测', type: 'full_drift', typeName: '满度', description: '满度漂移超过允许值时触发质控', threshold: '±2%FS', enabled: true },
  { id: 'qr4', name: '数据断缺检测', type: 'data_gap', typeName: '断数', description: '连续缺失数据超过设定时长时告警', threshold: '≥15分钟', enabled: true },
  { id: 'qr5', name: '恒值数据检测', type: 'constant', typeName: '恒值', description: '数据长时间不变时标记可疑', threshold: '≥4小时无变化', enabled: true },
  { id: 'qr6', name: '突变跳变检测', type: 'mutation', typeName: '突变', description: '数据突变超过阈值时标记可疑', threshold: '30%/5分钟', enabled: true },
]

const fraudClues: FraudClue[] = [
  { id: 'fc1', deviceId: 'd4', deviceCode: 'DEV-G-002', enterpriseName: '恒通钢铁厂', type: 'constant_data', typeName: '数据恒定', confidence: 92, detectTime: '2026-06-20 22:00:00', status: 'dispatched', description: 'SO₂数据连续6小时恒定在5.0mg/m³，与生产工况严重不符' },
  { id: 'fc2', deviceId: 'd1', deviceCode: 'DEV-W-001', enterpriseName: '华泰化工', type: 'mutation_jump', typeName: '突变跳变', confidence: 78, detectTime: '2026-06-21 04:30:00', status: 'detected', description: 'COD数据在3分钟内从45mg/L跳变至120mg/L，疑似采样异常' },
  { id: 'fc3', deviceId: 'd5', deviceCode: 'DEV-W-003', enterpriseName: '绿洲纸业', type: 'reverse_logic', typeName: '反向逻辑', confidence: 85, detectTime: '2026-06-21 01:00:00', status: 'verified', description: '生产加大但排放浓度反降，治污设施无调整记录' },
  { id: 'fc4', deviceId: 'd6', deviceCode: 'DEV-W-004', enterpriseName: '鼎盛电镀', type: 'offline_anomaly', typeName: '离线异常', confidence: 95, detectTime: '2026-06-21 06:00:00', status: 'dispatched', description: '设备反复离线，离线时段与生产高峰重合' },
  { id: 'fc5', deviceId: 'd8', deviceCode: 'DEV-G-003', enterpriseName: '永利建材', type: 'flow_anomaly', typeName: '流量异常', confidence: 71, detectTime: '2026-06-21 07:00:00', status: 'detected', description: '烟气流速异常偏低，可能存在稀释采样' },
]

const facilityStatuses: FacilityStatus[] = [
  { id: 'fs1', enterpriseId: 'e1', enterpriseName: '华泰化工', fanRunning: true, pumpRunning: true, dosingRunning: false, voltage: 380, sampleFlow: 1.2, productionOnline: true, timestamp: '2026-06-21 09:00:00' },
  { id: 'fs2', enterpriseId: 'e2', enterpriseName: '鑫源印染', fanRunning: true, pumpRunning: true, dosingRunning: true, voltage: 382, sampleFlow: 1.5, productionOnline: true, timestamp: '2026-06-21 09:00:00' },
  { id: 'fs3', enterpriseId: 'e3', enterpriseName: '恒通钢铁', fanRunning: true, pumpRunning: true, dosingRunning: true, voltage: 379, sampleFlow: 2.0, productionOnline: true, timestamp: '2026-06-21 09:00:00' },
  { id: 'fs4', enterpriseId: 'e4', enterpriseName: '绿洲纸业', fanRunning: true, pumpRunning: false, dosingRunning: true, voltage: 377, sampleFlow: 0.8, productionOnline: true, timestamp: '2026-06-21 09:00:00' },
  { id: 'fs5', enterpriseId: 'e6', enterpriseName: '天成制药', fanRunning: true, pumpRunning: true, dosingRunning: true, voltage: 381, sampleFlow: 1.3, productionOnline: true, timestamp: '2026-06-21 09:00:00' },
]

function genChartData(hours: number, base: number, variance: number) {
  const now = new Date()
  const values: [string, number][] = []
  for (let i = hours; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600000)
    const v = base + (Math.random() - 0.4) * variance
    values.push([t.toISOString(), Math.round(v * 100) / 100])
  }
  return values
}

export const mockData = {
  enterprises,
  outlets,
  devices,
  warningEvents,
  enforcementTasks,
  taxRecords,
  maintenanceOrders,
  qualityRules,
  fraudClues,
  facilityStatuses,
  chartData: {
    cod: genChartData(24, 65, 30),
    nh3n: genChartData(24, 6, 4),
    tp: genChartData(24, 0.8, 0.4),
    tn: genChartData(24, 12, 6),
    so2: genChartData(24, 40, 30),
    nox: genChartData(24, 80, 50),
    vocs: genChartData(24, 15, 12),
    dust: genChartData(24, 18, 14),
    ph: genChartData(24, 7.2, 1.5),
    flow: genChartData(24, 120, 40),
    temp: genChartData(24, 22, 5),
    o2: genChartData(24, 12, 3),
  },
  stats: {
    totalDevices: 48,
    onlineDevices: 42,
    onlineRate: 87.5,
    dataValidRate: 96.2,
    todayWarnings: 8,
    redWarnings: 2,
    orangeWarnings: 3,
    yellowWarnings: 3,
    pendingWarnings: 3,
    enforcementTotal: 15,
    enforcementCompleted: 11,
    enforcementRate: 73.3,
    rectifyRate: 85.7,
    totalEmission: 28456,
    codTotal: 12450,
    nh3nTotal: 1890,
    so2Total: 8560,
    noxTotal: 12300,
    taxTotal: 38648.64,
  },
  genTimeSeries,
}
