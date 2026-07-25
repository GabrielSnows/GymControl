import type { LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export type NavigationItem = {
  label: string
  href: string
  icon: LucideIcon
}

type BottomNavigationProps = {
  items: NavigationItem[]
}

export function BottomNavigation({ items }: BottomNavigationProps) {
  return (
    <nav
      className="bottom-navigation"
      aria-label="Navegação principal"
    >
      {items.map((item) => {
        const Icon = item.icon

        return (
          <NavLink
            key={item.href}
            to={item.href}
            aria-label={item.label}
            title={item.label}
            className={({ isActive }) =>
              isActive
                ? 'bottom-navigation__item bottom-navigation__item--active'
                : 'bottom-navigation__item'
            }
          >
            <Icon
              aria-hidden="true"
              strokeWidth={2}
              size={22}
            />

            <span className="sr-only">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}