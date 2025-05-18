'use client'

import { usePathname } from 'next/navigation'
import { ELink } from '@/components/ELink'
import { LogoutButton } from '@/components/LogoutButton'

const links = [
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/batches', label: 'Batches' },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b border-muted mb-6 flex justify-between items-center">
      <div className="container flex items-center gap-4 py-4">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href)
          return (
            <ELink
              key={link.href}
              href={link.href}
              className={`text-sm font-medium px-2 py-1 rounded-md ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {link.label}
            </ELink>
          )
        })}
      </div>

      <LogoutButton />
    </nav>
  )
}
