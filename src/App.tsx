import { Dumbbell, Layers3, Settings } from 'lucide-react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { MobileAppShell } from './components/layout/MobileAppShell'
import { BottomNavigation } from './components/navigation/BottomNavigation'
import type { NavigationItem } from './components/navigation/BottomNavigation'
import { FoundationPage } from './pages/FoundationPage'

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
        <Route
          path="/treinos"
          element={
            <FoundationPage
              eyebrow="Seu próximo treino"
              title="GymControl"
              description="A fundação mobile do aplicativo está configurada."
            />
          }
        />

        <Route
          path="/rotina"
          element={
            <FoundationPage
              eyebrow="Organização"
              title="Sua rotina"
              description="Aqui ficarão os treinos A, B, C e suas respectivas divisões."
            />
          }
        />

        <Route
          path="/ajustes"
          element={
            <FoundationPage
              eyebrow="Preferências"
              title="Ajustes"
              description="Aqui ficarão sua conta, aparência e opção de sair."
            />
          }
        />

        <Route path="/" element={<Navigate to="/treinos" replace />} />
        <Route path="*" element={<Navigate to="/treinos" replace />} />
      </Routes>

      <BottomNavigation items={navigationItems} />
    </MobileAppShell>
  )
}

export default App