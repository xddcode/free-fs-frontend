import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AddConfigCardProps {
  onClick: () => void;
}

export function AddConfigCard({ onClick }: AddConfigCardProps) {
  return (
    <Card
      className="h-full border-2 border-dashed cursor-pointer transition-all hover:-translate-y-2 hover:shadow-lg hover:border-primary bg-gradient-to-br from-primary/5 to-transparent"
      onClick={onClick}
    >
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 transition-transform hover:scale-110">
          <Plus className="h-8 w-8 text-primary" />
        </div>
        <div className="text-sm font-semibold mb-1">添加配置</div>
        <div className="text-xs text-muted-foreground">添加新的存储平台配置</div>
      </div>
    </Card>
  );
}
