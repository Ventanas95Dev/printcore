'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CreateBatchButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function createBatch(force = false) {
    const res = await fetch('/api/batches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(force ? { force: true } : {}),
    })

    const json = await res.json()

    if (json.status === 'created') {
      toast.success('Batch created', {
        description: `Batch ID: ${json.batch._id}`,
      })

      setTimeout(() => {
        router.push(`/admin/batches/${json.batch._id}`)
      }, 1000)
    } else if (json.status === 'waiting' && !force) {
      toast(
        (t) => (
          <div className="space-y-2">
            <p>{json.message}</p>
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
          </div>
        ),
        { duration: 10000 }
      )
    } else if (json.status === 'no-items') {
      toast.error('No available items to batch.')
    } else {
      toast.error('Failed to create batch')
    }
  }

  function handleClick() {
    startTransition(() => createBatch())
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create batches'}
    </Button>
  )
}
