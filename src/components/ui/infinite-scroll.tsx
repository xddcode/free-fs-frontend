import * as React from 'react'

interface InfiniteScrollProps {
  isLoading: boolean
  hasMore: boolean
  next: () => unknown
  threshold?: number
  root?: Element | Document | null
  rootMargin?: string
  reverse?: boolean
  children?: React.ReactNode
}

export default function InfiniteScroll({
  isLoading,
  hasMore,
  next,
  /** 1 要求哨兵完全进入可视区才触发，小目标易漏触发；0 更稳 */
  threshold = 0,
  root = null,
  /** 过大时首屏哨兵已在「扩展视口」内会立刻触发下一页；默认 0 */
  rootMargin = '0px',
  reverse,
  children,
}: InfiniteScrollProps) {
  const observerRef = React.useRef<IntersectionObserver | null>(null)
  const [sentinelNode, setSentinelNode] = React.useState<HTMLElement | null>(
    null
  )

  const setSentinelRef = React.useCallback((el: HTMLElement | null) => {
    setSentinelNode((prev) => (prev === el ? prev : el))
  }, [])

  React.useEffect(() => {
    if (!sentinelNode) return

    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (isLoading || !hasMore) return

    let safeThreshold = threshold
    if (threshold < 0 || threshold > 1) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          'threshold should be between 0 and 1. Using default value: 1'
        )
      }
      safeThreshold = 1
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          next()
        }
      },
      { threshold: safeThreshold, root: root ?? null, rootMargin }
    )
    obs.observe(sentinelNode)
    observerRef.current = obs

    return () => {
      obs.disconnect()
      observerRef.current = null
    }
  }, [
    sentinelNode,
    isLoading,
    hasMore,
    next,
    threshold,
    root,
    rootMargin,
  ])

  const flattenChildren = React.useMemo(
    () => React.Children.toArray(children),
    [children]
  )

  return (
    <>
      {flattenChildren.map((child, index) => {
        if (!React.isValidElement(child)) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('You should use a valid element with InfiniteScroll')
          }
          return child
        }

        const isObserveTarget = reverse
          ? index === 0
          : index === flattenChildren.length - 1
        const ref = isObserveTarget ? setSentinelRef : null
        return React.cloneElement(child, { ref } as object)
      })}
    </>
  )
}
