import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Dashboard from '@/pages/Dashboard'
import MonitorOverview from '@/pages/MonitorOverview'
import MonitorWater from '@/pages/MonitorWater'
import MonitorGas from '@/pages/MonitorGas'
import MonitorFacility from '@/pages/MonitorFacility'
import WarningList from '@/pages/WarningList'
import WarningDetail from '@/pages/WarningDetail'
import WarningLinkage from '@/pages/WarningLinkage'
import TaxCalc from '@/pages/TaxCalc'
import TaxLedger from '@/pages/TaxLedger'
import EnforcementList from '@/pages/EnforcementList'
import EnforcementOnsite from '@/pages/EnforcementOnsite'
import EnforcementRectify from '@/pages/EnforcementRectify'
import EnforcementDetail from '@/pages/EnforcementDetail'
import MaintenanceDevices from '@/pages/MaintenanceDevices'
import MaintenanceOrders from '@/pages/MaintenanceOrders'
import MaintenanceQuality from '@/pages/MaintenanceQuality'
import QualityRules from '@/pages/QualityRules'
import QualityFraud from '@/pages/QualityFraud'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="monitor" element={<MonitorOverview />} />
          <Route path="monitor/water" element={<MonitorWater />} />
          <Route path="monitor/gas" element={<MonitorGas />} />
          <Route path="monitor/facility" element={<MonitorFacility />} />
          <Route path="warning" element={<WarningList />} />
          <Route path="warning/:id" element={<WarningDetail />} />
          <Route path="warning/linkage" element={<WarningLinkage />} />
          <Route path="tax" element={<TaxCalc />} />
          <Route path="tax/ledger" element={<TaxLedger />} />
          <Route path="enforcement" element={<EnforcementList />} />
          <Route path="enforcement/onsite" element={<EnforcementOnsite />} />
          <Route path="enforcement/detail" element={<EnforcementDetail />} />
          <Route path="enforcement/rectify" element={<EnforcementRectify />} />
          <Route path="maintenance" element={<MaintenanceDevices />} />
          <Route path="maintenance/orders" element={<MaintenanceOrders />} />
          <Route path="maintenance/quality" element={<MaintenanceQuality />} />
          <Route path="quality" element={<QualityRules />} />
          <Route path="quality/fraud" element={<QualityFraud />} />
        </Route>
      </Routes>
    </Router>
  )
}
