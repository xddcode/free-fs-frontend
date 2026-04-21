import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type BulkSelectionBarProps = {
  selectedCount: number
  onClear: () => void
  children: React.ReactNode
  /** 工具栏无障碍名称 */
  ariaLabel?: string
  /** 数量右侧说明文案，默认使用 common.bulkSelection.suffix */
  selectionSuffix?: string
  /** 选中变化时读屏播报 */
  getAnnouncement?: (count: number) => string
}

export function BulkSelectionBar({
  selectedCount,
  onClear,
  children,
  ariaLabel,
  selectionSuffix,
  getAnnouncement,
}: BulkSelectionBarProps) {
  const { t } = useTranslation('common')
  const label = ariaLabel ?? t('bulkSelection.defaultToolbarName')
  const suffix = selectionSuffix ?? t('bulkSelection.suffix')
  const [mounted, setMounted] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [announcement, setAnnouncement] = useState('')
  const descId = useId()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedCount > 0) {
      queueMicrotask(() => {
        setAnnouncement(
          getAnnouncement
            ? getAnnouncement(selectedCount)
            : t('bulkSelection.announce', { count: selectedCount })
        )
      })
      const hideTimer = setTimeout(() => setAnnouncement(''), 3000)
      return () => clearTimeout(hideTimer)
    }
  }, [selectedCount, getAnnouncement, t])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const buttons = toolbarRef.current?.querySelectorAll('button')
    if (!buttons?.length) return

    const currentIndex = Array.from(buttons).findIndex(
      (b) => b === document.activeElement
    )

    switch (event.key) {
      case 'ArrowRight': {
        event.preventDefault()
        buttons[(currentIndex + 1) % buttons.length]?.focus()
        break
      }
      case 'ArrowLeft': {
        event.preventDefault()
        buttons[
          currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1
        ]?.focus()
        break
      }
      case 'Home':
        event.preventDefault()
        buttons[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        buttons[buttons.length - 1]?.focus()
        break
      case 'Escape': {
        const target = event.target as HTMLElement
        const active = document.activeElement as HTMLElement
        const isDropdown =
          target?.closest('[data-slot="dropdown-menu-trigger"]') ||
          active?.closest('[data-slot="dropdown-menu-trigger"]') ||
          active?.closest('[data-slot="dropdown-menu-content"]') ||
          target?.closest('[data-slot="dropdown-menu-content"]')
        if (isDropdown) return
        event.preventDefault()
        onClear()
        break
      }
    }
  }

  if (selectedCount === 0 || !mounted) return null

  const bar = (
    <>
      <div
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
        role='status'
      >
        {announcement}
      </div>

      <div
        ref={toolbarRef}
        role='toolbar'
        aria-label={t('bulkSelection.toolbarAria', {
          label,
          count: selectedCount,
        })}
        aria-describedby={descId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          'fixed bottom-6 left-1/2 z-50 isolate -translate-x-1/2',
          'rounded-xl border border-input bg-background px-3 py-2 shadow-xs',
          'flex items-center gap-3',
          'transition-all delay-100 duration-300 ease-out hover:scale-105',
          'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='icon'
              className='size-6 shrink-0 rounded-full'
              onClick={onClear}
              aria-label={t('bulkSelection.clear')}
              title={t('bulkSelection.clearHint')}
            >
              <X />
              <span className='sr-only'>{t('bulkSelection.clear')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('bulkSelection.clearHint')}</p>
          </TooltipContent>
        </Tooltip>

        <Separator orientation='vertical' className='h-5' aria-hidden />

        <div
          id={descId}
          className='flex min-w-0 items-center gap-2 text-sm text-foreground'
        >
          <span
            className='inline-flex min-w-7 items-center justify-center rounded-xl bg-primary px-2 py-0.5 text-xs font-semibold tabular-nums text-primary-foreground'
            aria-label={t('bulkSelection.countBadgeAria', {
              count: selectedCount,
            })}
          >
            {selectedCount}
          </span>
          <span className='hidden whitespace-nowrap text-muted-foreground sm:inline'>
            {suffix}
          </span>
        </div>

        <Separator orientation='vertical' className='h-5' aria-hidden />

        <div className='flex items-center gap-1.5'>{children}</div>
      </div>
    </>
  )

  return createPortal(
    <TooltipProvider>{bar}</TooltipProvider>,
    document.body
  )
}
