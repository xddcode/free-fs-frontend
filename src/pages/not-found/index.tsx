import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl text-[var(--color-text-2)] mb-8">页面未找到</p>
      <Button onClick={() => navigate('/')}>返回首页</Button>
    </div>
  );
}
