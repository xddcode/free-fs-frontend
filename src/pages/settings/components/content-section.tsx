import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  SettingsPageDescription,
  SettingsPageTitle,
} from './settings-page-header'

type ContentSectionProps = {
  title: string
  desc: string
  children: React.ReactNode
  /** 为 false 时内容区限制为 max-w-4xl；弹窗内默认铺满 */
  fullWidth?: boolean
}

export function ContentSection({
  title,
  desc,
  children,
  fullWidth = true,
}: ContentSectionProps) {
  return (
    <div className='flex flex-1 flex-col'>
      <header className='flex-none'>
        <SettingsPageTitle>{title}</SettingsPageTitle>
        <SettingsPageDescription>{desc}</SettingsPageDescription>
      </header>
      <Separator className='my-6 flex-none' />
      <div className='faded-bottom h-full w-full overflow-y-auto scroll-smooth pb-12'>
        <div
          className={cn('w-full', fullWidth ? 'max-w-none' : 'max-w-4xl')}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
