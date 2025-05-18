import { Nav } from '@/components/Nav'

export default function AdminLayout({ children }) {
  return (
    <div>
      <Nav />
      <div className="container py-6 px-6">{children}</div>
    </div>
  )
}
