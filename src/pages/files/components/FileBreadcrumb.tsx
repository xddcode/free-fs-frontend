import { Fragment } from 'react'
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
  return (
    <div className='py-3'>
      <Breadcrumb>
        <BreadcrumbList className='text-base'>
          {/* 根目录 */}
          <BreadcrumbItemUI>
            {customTitle ? (
              <BreadcrumbPage>{customTitle}</BreadcrumbPage>
            ) : breadcrumbPath.length === 0 ? (
              <BreadcrumbPage>全部文件</BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                onClick={() => onNavigate()}
                className='cursor-pointer hover:text-foreground'
              >
                全部文件
              </BreadcrumbLink>
            )}
          </BreadcrumbItemUI>

          {/* 面包屑路径 */}
          {!customTitle &&
            breadcrumbPath.map((item, index) => {
              const isLast = index === breadcrumbPath.length - 1
              return (
                <Fragment key={item.id}>
                  <BreadcrumbSeparator>
                    <ChevronRight className='h-4 w-4' />
                  </BreadcrumbSeparator>
                  <BreadcrumbItemUI>
                    {isLast ? (
                      <BreadcrumbPage>{item.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => onNavigate(item.id)}
                        className='cursor-pointer hover:text-foreground'
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
