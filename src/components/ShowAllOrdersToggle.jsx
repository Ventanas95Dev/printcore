'use client'
import { useRouter, useSearchParams } from 'next/navigation'

export function ShowAllOrdersToggle() {
  const router = useRouter()
  const params = useSearchParams()
  const showAll = params.get('showall') === 'true'

  function toggle() {
    const newParams = new URLSearchParams(params.toString())
    if (showAll) {
      newParams.delete('showall')
    } else {
      newParams.set('showall', 'true')
    }
    router.replace(`/admin/orders?${newParams.toString()}`)
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={showAll} onChange={toggle} />
      Show all orders
    </label>
  )
}
