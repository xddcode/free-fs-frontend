import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <h1 className='mb-4 text-6xl font-bold'>404</h1>
      <p className='mb-8 text-xl text-[var(--color-text-2)]'>
        抱歉，您访问的页面不存在
      </p>
      <Button onClick={() => navigate('/')}>返回首页</Button>
    </div>
  )
}
