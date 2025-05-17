'use client'

import { toast } from 'sonner'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

export function SyncOrdersButton({ orders }) {
  const [isPending, startTransition] = useTransition()

  async function handleSync() {
    startTransition(async () => {
      const latest = orders?.length
        ? new Date(Math.max(...orders.map((o) => new Date(o.createdAt).getTime()))).toISOString()
        : null

      const res = await fetch('/api/sync-orders', {
        method: 'POST',
        body: JSON.stringify({ since: latest }),
      })

      const json = await res.json()

      if (json.status === 'ok') {
        toast.success('Orders synced', {
          description: `Imported ${json.imported} new order(s).`,
        })
      } else {
        toast.error('Sync failed', {
          description: json.error,
        })
      }
    })
  }

  return (
    <Button onClick={handleSync} disabled={isPending} variant="outline">
      {isPending ? 'Syncing...' : 'Sync orders'}
    </Button>
  )
}
