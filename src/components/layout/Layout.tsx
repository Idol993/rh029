import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useStore } from '@/store'

export default function Layout() {
  const { sidebarCollapsed } = useStore()

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <Header />
      <main
        className="pt-14 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '64px' : '224px' }}
      >
        <div className="p-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
