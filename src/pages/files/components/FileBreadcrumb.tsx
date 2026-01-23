import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '@/types/file';
import {
  Breadcrumb,
  BreadcrumbItem as BreadcrumbItemUI,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface FileBreadcrumbProps {
  breadcrumbPath: BreadcrumbItem[];
  customTitle?: string;
  onNavigate: (folderId?: string) => void;
}

export function FileBreadcrumb({ breadcrumbPath, customTitle, onNavigate }: FileBreadcrumbProps) {
  return (
    <div className="py-3">
      <Breadcrumb>
        <BreadcrumbList>
          {/* 根目录 */}
          <BreadcrumbItemUI>
            {customTitle ? (
              <BreadcrumbPage className="flex items-center gap-1.5">
                <Home className="h-4 w-4" />
                {customTitle}
              </BreadcrumbPage>
            ) : breadcrumbPath.length === 0 ? (
              <BreadcrumbPage className="flex items-center gap-1.5">
                <Home className="h-4 w-4" />
                全部文件
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                onClick={() => onNavigate()}
                className="flex items-center gap-1.5 cursor-pointer hover:text-foreground"
              >
                <Home className="h-4 w-4" />
                全部文件
              </BreadcrumbLink>
            )}
          </BreadcrumbItemUI>

          {/* 面包屑路径 */}
          {!customTitle &&
            breadcrumbPath.map((item, index) => {
              const isLast = index === breadcrumbPath.length - 1;
              return (
                <BreadcrumbItemUI key={item.id}>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                  {isLast ? (
                    <BreadcrumbPage>{item.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink onClick={() => onNavigate(item.id)} className="cursor-pointer hover:text-foreground">
                      {item.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItemUI>
              );
            })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
