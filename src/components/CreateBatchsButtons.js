'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CreateBatchButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function createBatch(force = false) {
    const res = await fetch('/api/admin/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(force ? { force: true } : {}),
    })

    const json = await res.json()

    if (json.status === 'created') {
      const batchCount = json.batches?.length || 1
      console.log(json)
      toast.success(batchCount > 1 ? `${batchCount} batches created` : 'Batch created')
      router.refresh()
    } else if (json.status === 'empty') {
      toast.info('No batches created', {
        description: json.message,
      })
    } else if (json.status === 'waiting' && !force) {
      toast(
        (t) => (
          <div className="space-y-2">
            <p>
              {json.message}
              {json.unbatchedItemCount != null && <> ({json.unbatchedItemCount} items available)</>}
            </p>

            {json.unbatchedItemCount > 0 && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.dismiss(t)
                    startTransition(() => createBatch(true))
                  }}
                >
                  Force create
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast.dismiss(t)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ),
        { duration: 10000 }
      )
    } else {
      toast.error('Failed to create batch')
    }
  }

  return (
    <Button onClick={() => startTransition(() => createBatch())} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create batches'}
    </Button>
  )
}
