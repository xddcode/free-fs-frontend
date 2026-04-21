import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import type { BreadcrumbItem } from '@/types/file'
import { ChevronRight } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface FileBreadcrumbProps {
  breadcrumbPath: BreadcrumbItem[]
  customTitle?: string
  onNavigate: (folderId?: string) => void
}

export function FileBreadcrumb({
  breadcrumbPath,
  customTitle,
  onNavigate,
}: FileBreadcrumbProps) {
  const { t } = useTranslation('files')
  // 只有多层级时才应用透明度
  const hasMultipleLevels = breadcrumbPath.length > 0
  
  // 前面的层级统一使用 0.5 透明度，最后一级使用 1.0
  const getOpacity = (isLast: boolean) => {
    if (!hasMultipleLevels) return 1
    return isLast ? 1 : 0.5
  }

  return (
    <div className='py-3'>
      <Breadcrumb>
        <BreadcrumbList>
          {/* 根目录 */}
          <BreadcrumbItemUI style={{ opacity: getOpacity(breadcrumbPath.length === 0) }} className='transition-all'>
            {customTitle ? (
              <BreadcrumbPage className='text-xl font-semibold tracking-tight text-foreground'>{customTitle}</BreadcrumbPage>
            ) : breadcrumbPath.length === 0 ? (
              <BreadcrumbPage className='text-xl font-semibold tracking-tight text-foreground'>
                {t('breadcrumb.allFiles')}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                onClick={() => onNavigate()}
                className='cursor-pointer text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors'
              >
                {t('breadcrumb.allFiles')}
              </BreadcrumbLink>
            )}
          </BreadcrumbItemUI>

          {/* 面包屑路径 */}
          {!customTitle &&
            breadcrumbPath.map((item, index) => {
              const isLast = index === breadcrumbPath.length - 1
              const opacity = getOpacity(isLast)
              
              return (
                <Fragment key={item.id}>
                  <BreadcrumbSeparator style={{ opacity }} className='transition-opacity'>
                    <ChevronRight className='h-4 w-4' />
                  </BreadcrumbSeparator>
                  <BreadcrumbItemUI style={{ opacity }} className='transition-all'>
                    {isLast ? (
                      <BreadcrumbPage className='text-xl font-semibold tracking-tight text-foreground'>{item.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => onNavigate(item.id)}
                        className='cursor-pointer text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors'
                      >
                        {item.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItemUI>
                </Fragment>
              )
            })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
