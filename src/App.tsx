import { Dumbbell, Layers3, Settings } from 'lucide-react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { MobileAppShell } from './components/layout/MobileAppShell'
import {
  BottomNavigation,
  type NavigationItem,
} from './components/navigation/BottomNavigation'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { RoutinePage } from './pages/routine/RoutinePage'
import { WorkoutEditorPage } from './pages/routine/WorkoutEditorPage'

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

function MainApplication() {
  return (
    <MobileAppShell>
      <Routes>
        <Route path="treinos" element={<DesignSystemPage />} />

        <Route path="rotina" element={<RoutinePage />} />

        <Route
          path="rotina/:workoutId"
          element={<WorkoutEditorPage />}
        />

        <Route path="ajustes" element={<DesignSystemPage />} />

        <Route
          path="*"
          element={<Navigate to="rotina" replace />}
        />
      </Routes>

      <BottomNavigation items={navigationItems} />
    </MobileAppShell>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />

      <Route path="/*" element={<MainApplication />} />
    </Routes>
  )
}

export default App