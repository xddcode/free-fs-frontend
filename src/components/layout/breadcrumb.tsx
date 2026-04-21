import { useTranslation } from 'react-i18next'
import { useLocation, Link } from 'react-router-dom'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

/** 逻辑路径（含 `/w/:slug` 前缀剥离后）→ `breadcrumb` 下的键名 */
const BREADCRUMB_PATH_KEYS: Record<string, string> = {
  '/': 'home',
  '/files': 'allFiles',
  '/transfer': 'transfer',
  '/storage': 'storage',
  '/settings': 'settings',
  '/settings/appearance': 'appearance',
  '/settings/transfer': 'transferSettings',
}

function parseSegments(pathname: string): { homeHref: string; segments: string[] } {
  const ws = pathname.match(/^(\/w\/[^/]+)(?:\/(.*))?$/)
  if (ws) {
    const base = ws[1]
    const tail = ws[2]
    const segments = tail
      ? tail.split('/').filter(Boolean)
      : []
    return { homeHref: `${base}/`, segments }
  }
  return {
    homeHref: '/',
    segments: pathname.split('/').filter(Boolean),
  }
}

export function AppBreadcrumb() {
  const { t } = useTranslation('layout')
  const location = useLocation()
  const { homeHref, segments } = parseSegments(location.pathname)

  if (segments.length === 0) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{t('breadcrumb.home')}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  const ws = location.pathname.match(/^(\/w\/[^/]+)/)

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className='hidden md:block'>
          <BreadcrumbLink asChild>
            <Link to={homeHref}>{t('breadcrumb.home')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className='hidden md:block' />
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1
          const logicalPath = `/${segments.slice(0, index + 1).join('/')}`
          const key = BREADCRUMB_PATH_KEYS[logicalPath]
          const name = key ? t(`breadcrumb.${key}`) : segment
          const pathHref = ws
            ? `${ws[1]}/${segments.slice(0, index + 1).join('/')}`
            : `/${segments.slice(0, index + 1).join('/')}`

          return (
            <div key={pathHref} className='flex items-center gap-2'>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={pathHref}>{name}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
