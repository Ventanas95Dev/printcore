'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SyncPaymentsButton({ fromDate }) {
  const router = useRouter()
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState(null)

  async function syncPaymentsUntilDone({ fromDate = null, delayMs = 1000 } = {}) {
    let page = 1
    let done = false
    let latestSync = fromDate
    let totalUpdated = 0

    setIsSyncing(true)
    setMessage('⏳ Starting sync...')

    while (!done) {
      setMessage(`🔁 Sync round ${page}...`)
      const res = await fetch('/api/admin/orders/sync-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromDate: latestSync }),
      })

      const data = await res.json()
      if (data.updated > 0) {
        totalUpdated += data.updated
        latestSync = new Date().toISOString()
        page++
        await new Promise((r) => setTimeout(r, delayMs))
      } else {
        done = true
      }
    }

    setMessage(`✅ Sync complete. ${totalUpdated} orders updated.`)
    setIsSyncing(false)
    router.refresh()

    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => syncPaymentsUntilDone({ fromDate, delayMs: 1000 })}
        disabled={isSyncing}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSyncing ? 'Syncing...' : 'Sync Payments'}
      </button>
      {message && <div className="text-sm text-gray-700">{message}</div>}
    </div>
  )
}
