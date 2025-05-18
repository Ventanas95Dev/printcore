'use client'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CreatePrintFileButton({ batchId }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  async function handleClick() {
    startTransition(async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_RENDER_URL + '/create-print-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_RENDER_API_KEY}`,
        },
        body: JSON.stringify({ batchId }),
      })

      const json = await res.json()

      if (res.ok) {
        toast.success('Print file generated', {
          description: 'Done!',
        })
      } else {
        toast.error('Failed to generate file', {
          description: json.error || 'Unknown error',
        })
      }

      router.refresh()
    })
  }

  return (
    <Button onClick={handleClick} disabled={isPending}>
      {isPending ? 'Generating…' : 'Generate print file'}
    </Button>
  )
}
