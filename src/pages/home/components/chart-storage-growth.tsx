import type { HomeUsedBytesUnit } from '@/api/home'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { cn } from '@/lib/utils'

type ChartStorageGrowthProps = {
  className?: string
  unit: HomeUsedBytesUnit
  onUnitChange: (unit: HomeUsedBytesUnit) => void
}

export function ChartStorageGrowth({
  className,
  unit,
  onUnitChange,
}: ChartStorageGrowthProps) {
  return (
    <ChartAreaInteractive
      unit={unit}
      onUnitChange={onUnitChange}
      className={cn(
        'h-full min-h-0 bg-transparent shadow-none',
        className
      )}
    />
  )
}
