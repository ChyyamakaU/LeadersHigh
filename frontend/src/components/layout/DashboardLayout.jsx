import { Sidebar, Header, MobileSidebar } from './Sidebar'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-snow dark:bg-primary">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Sidebar />
      <div className="lg:pl-64 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  )
}
