'use client'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const SendToPrinterButton = ({ printFileUrl, batchId }) => {
  useEffect(() => {
    window.electronAPI?.onPrintComplete?.((event, data) => {
      console.log('🖨️ Print complete:', data)
      // Kalla din API för att markera batch/order som "sent"

      fetch(`/api/admin/batches/${data.batchId}/mark-printed`, {
        method: 'POST',
        body: JSON.stringify({ printedAt: data.timestamp }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then(async (res) => {
          if (!res.ok) {
            const error = await res.text()
            throw new Error(`API failed: ${res.status} ${error}`)
          }
          toast.success('Batch marked as sent to printer')
        })
        .catch((err) => {
          console.error('❌ Failed to mark batch:', err)
          toast.error('Failed to update batch status')
        })
    })
  }, [])
  return (
    printFileUrl && (
      <Button onClick={() => window?.electronAPI?.sendToPrinter({ url: printFileUrl, batchId })}>
        🖨️ Send to printer
      </Button>
    )
  )
}
