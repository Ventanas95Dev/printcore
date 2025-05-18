'use client'

import { ELink } from '@/components/ELink'

export function Pagination({ currentPage, totalPages }) {
  if (totalPages <= 1) return null

  const createPageLink = (page) => `?page=${page}`

  const paginationRange = () => {
    const delta = 2
    const pages = []

    const left = Math.max(2, currentPage - delta)
    const right = Math.min(totalPages - 1, currentPage + delta)

    pages.push(1)

    if (left > 2) {
      pages.push('...')
    }

    for (let i = left; i <= right; i++) {
      pages.push(i)
    }

    if (right < totalPages - 1) {
      pages.push('...')
    }

    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav className="flex justify-center items-center gap-2 mt-6 flex-wrap text-sm">
      {currentPage > 1 && (
        <ELink
          href={createPageLink(currentPage - 1)}
          className="px-3 py-1 rounded-md hover:underline text-muted-foreground"
        >
          ← Prev
        </ELink>
      )}

      {paginationRange().map((page, idx) =>
        typeof page === 'number' ? (
          <ELink
            key={idx}
            href={createPageLink(page)}
            className={`px-3 py-1 rounded-md ${
              page === currentPage
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:underline'
            }`}
          >
            {page}
          </ELink>
        ) : (
          <span key={idx} className="px-2 text-muted-foreground">
            ...
          </span>
        )
      )}

      {currentPage < totalPages && (
        <ELink
          href={createPageLink(currentPage + 1)}
          className="px-3 py-1 rounded-md hover:underline text-muted-foreground"
        >
          Next →
        </ELink>
      )}
    </nav>
  )
}
