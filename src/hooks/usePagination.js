import { useState } from 'react'

/* Client-side paging. Pass a resetKey (filters, search, sort) and the page
   jumps back to 1 whenever it changes. */
export default function usePagination(items, pageSize, resetKey = '') {
  const [state, setState] = useState({ page: 1, key: resetKey })

  let page = state.page
  if (state.key !== resetKey) {
    page = 1
    setState({ page: 1, key: resetKey })
  }

  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize

  return {
    page: current,
    pageCount,
    total,
    from: total ? start + 1 : 0,
    to: Math.min(start + pageSize, total),
    pageItems: items.slice(start, start + pageSize),
    setPage: (next) => setState((s) => ({ ...s, page: next })),
  }
}
