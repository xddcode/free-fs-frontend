import { useEffect, useRef } from 'react'

interface FileListScrollSentinelProps {
  scrollRootRef: React.RefObject<HTMLElement | null>
  hasMore: boolean
  onLoadMore: () => void
}

/**
 * 置于列表底部，进入滚动区域可视范围时触发加载下一页（root 须为实际滚动的祖先）。
 * 重复触发由 useFileList.loadMore 内部防抖。
 */
export function FileListScrollSentinel({
  scrollRootRef,
  hasMore,
  onLoadMore,
}: FileListScrollSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore) return
    const root = scrollRootRef.current
    const el = sentinelRef.current
    if (!root || !el) return

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return
        onLoadMore()
      },
      { root, rootMargin: '120px 0px', threshold: 0 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [scrollRootRef, hasMore, onLoadMore])

  if (!hasMore) return null

  return (
    <div
      ref={sentinelRef}
      className='h-2 w-full shrink-0'
      aria-hidden
    />
  )
}
