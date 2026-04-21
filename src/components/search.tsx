import { useTranslation } from 'react-i18next'
import { SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearch } from '@/context/search-provider'
import { Button } from '@/components/ui/button'

type SearchProps = {
  className?: string
  type?: React.HTMLInputTypeAttribute
  placeholder?: string
}

export function Search({
  className = '',
  placeholder,
}: SearchProps) {
  const { t } = useTranslation('common')
  const defaultPlaceholder = placeholder ?? t('searchShortcut')
  const { setOpen } = useSearch()
  return (
    <Button
      type='button'
      variant='outline'
      className={cn(
        'group relative h-9 min-w-0 w-[260px] max-w-[min(100%,260px)] shrink-0 justify-start overflow-hidden rounded-md bg-muted/25 px-2 text-sm font-normal text-muted-foreground shadow-none hover:bg-accent sm:pe-12',
        className
      )}
      onClick={() => setOpen(true)}
    >
      <SearchIcon
        aria-hidden='true'
        className='absolute start-2 top-1/2 -translate-y-1/2'
        size={16}
      />
      <span className='ms-7 truncate pr-1 text-left'>
        {defaultPlaceholder}
      </span>
      <kbd className='pointer-events-none absolute end-1.5 top-1/2 hidden h-5 -translate-y-1/2 items-center gap-1 rounded border bg-muted px-1 font-mono text-[10px] font-medium leading-none opacity-100 select-none group-hover:bg-accent sm:flex'>
        <span className='text-xs'>⌘</span>K
      </kbd>
    </Button>
  )
}
