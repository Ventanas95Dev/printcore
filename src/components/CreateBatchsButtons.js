'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function CreateBatchButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleClick() {
    startTransition(async () => {
      const res = await fetch('/api/batches', { method: 'POST' })
      const json = await res.json()

      if (json.status === 'created') {
        toast.success('Batch created', {
          description: `Batch ID: ${json.batch._id}`,
        })

        // Optional redirect to the batch page
        setTimeout(() => {
          router.push(`/admin/batch/${json.batch._id}`)
        }, 1000)
      } else {
        toast.info('Not enough orders', {
          description: json.message,
        })
      }
    })
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create batches'}
    </Button>
  )
}
