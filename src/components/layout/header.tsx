import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTheme } from '@/components/theme-provider'
import { Search } from '@/components/search'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const { t } = useTranslation('layout')
  const [offset, setOffset] = useState(0)
  const { theme } = useTheme()

  // 判断当前是否是暗色主题
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed && 'header-fixed peer/header sticky top-0 w-[inherit]',
        offset > 10 && fixed ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full w-full items-center gap-3 px-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/95 after:backdrop-blur supports-[backdrop-filter]:after:bg-background/60'
        )}
      >
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <div className='flex shrink-0 items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='h-4' />
          </div>
          <Search />
          <div className='min-w-0 flex-1'>{children}</div>
        </div>
        <div className='flex shrink-0 items-center justify-end gap-1'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' asChild className='h-9 w-9'>
                  <a
                    href='https://github.com/dromara/free-fs'
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='GitHub'
                  >
                    <img
                      src='/svg/github.svg'
                      alt=''
                      className='h-4 w-4'
                      aria-hidden
                    />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>GitHub</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' asChild className='h-9 w-9'>
                  <a
                    href='https://gitee.com/dromara/free-fs'
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Gitee'
                  >
                    <img
                      src='/svg/gitee.svg'
                      alt=''
                      className='h-4 w-4'
                      aria-hidden
                    />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gitee</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation='vertical' className='mx-1 h-4' />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <AnimatedThemeToggler className='inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground' />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isDark ? t('header.lightMode') : t('header.darkMode')}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  )
}
