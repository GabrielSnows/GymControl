import {
  Dumbbell,
  Layers3,
  Settings,
} from 'lucide-react'
import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import { MobileAppShell } from './components/layout/MobileAppShell'
import {
  BottomNavigation,
  type NavigationItem,
} from './components/navigation/BottomNavigation'
import { DesignSystemPage } from './pages/DesignSystemPage'

const navigationItems: NavigationItem[] = [
  {
    label: 'Treinos',
    href: '/treinos',
    icon: Dumbbell,
  },
  {
    label: 'Rotina',
    href: '/rotina',
    icon: Layers3,
  },
  {
    label: 'Ajustes',
    href: '/ajustes',
    icon: Settings,
  },
]

function App() {
  return (
    <MobileAppShell>
      <Routes>
        <Route path="/treinos" element={<DesignSystemPage />} />
        <Route path="/rotina" element={<DesignSystemPage />} />
        <Route path="/ajustes" element={<DesignSystemPage />} />

        <Route path="/" element={<Navigate to="/treinos" replace />} />
        <Route path="*" element={<Navigate to="/treinos" replace />} />
      </Routes>

      <BottomNavigation items={navigationItems} />
    </MobileAppShell>
  )
}

export default App