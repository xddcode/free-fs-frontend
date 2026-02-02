import { useEffect, useRef } from 'react'
import LoadingBar from 'react-top-loading-bar'

export function NavigationProgress() {
  const ref = useRef<any>(null)

  useEffect(() => {
    let timeoutId: number
    let isNavigating = false

    const startProgress = () => {
      if (isNavigating || !ref.current) return
      isNavigating = true
      ref.current.continuousStart()
      
      // 超时保护：最多显示 1 秒
      timeoutId = window.setTimeout(() => {
        if (ref.current) {
          ref.current.complete()
        }
        isNavigating = false
      }, 1000)
    }

    const completeProgress = () => {
      window.clearTimeout(timeoutId)
      if (ref.current) {
        ref.current.complete()
      }
      isNavigating = false
    }

    // 监听链接点击
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (link) {
        const href = link.getAttribute('href')
        // 检查是否是内部路由链接
        if (href && href.startsWith('/') && !href.startsWith('//')) {
          startProgress()
        }
      }
    }

    // 监听浏览器前进/后退
    const handlePopState = () => {
      startProgress()
    }

    // 监听 DOM 变化来检测路由完成
    let mutationTimeout: number
    const observer = new MutationObserver(() => {
      window.clearTimeout(mutationTimeout)
      mutationTimeout = window.setTimeout(() => {
        if (isNavigating) {
          completeProgress()
        }
      }, 100)
    })

    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    return () => {
      window.clearTimeout(timeoutId)
      window.clearTimeout(mutationTimeout)
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
      observer.disconnect()
    }
  }, [])

  return (
    <LoadingBar
      color='var(--primary)'
      ref={ref}
      height={2}
      shadow={true}
    />
  )
}