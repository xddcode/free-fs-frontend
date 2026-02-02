import { Download, Share2, Heart, Move, Trash2, X } from 'lucide-react';
import { Dock, DockIcon } from '@/components/ui/dock';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SelectionDockProps {
  selectedCount: number;
  hasUnfavorited: boolean; // 是否有未收藏的文件
  onDownload: () => void;
  onShare: () => void;
  onFavorite: () => void;
  onMove: () => void;
  onDelete: () => void;
  onClear: () => void;
}

export function SelectionDock({
  selectedCount,
  hasUnfavorited,
  onDownload,
  onShare,
  onFavorite,
  onMove,
  onDelete,
  onClear,
}: SelectionDockProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <TooltipProvider>
        <Dock 
          direction="middle"
          className="h-16 px-4"
        >
            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded-full"
                    onClick={onDownload}
                    aria-label="下载"
                  >
                    <Download className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>下载</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>

            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded-full"
                    onClick={onShare}
                    aria-label="分享"
                  >
                    <Share2 className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>分享</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>

            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded-full"
                    onClick={onFavorite}
                    aria-label="收藏"
                  >
                    <Heart 
                      className="size-5" 
                      fill={hasUnfavorited ? 'none' : 'currentColor'}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>收藏</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>

            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded-full"
                    onClick={onMove}
                    aria-label="移动到"
                  >
                    <Move className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>移动到</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>

            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded-full"
                    onClick={onDelete}
                    aria-label="删除"
                  >
                    <Trash2 className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>删除</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>

            <Separator orientation="vertical" className="h-8 mx-2" />

            <DockIcon>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded-full"
                    onClick={onClear}
                    aria-label="清空"
                  >
                    <X className="size-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>清空</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          </Dock>
        </TooltipProvider>
      </div>
  );
}
