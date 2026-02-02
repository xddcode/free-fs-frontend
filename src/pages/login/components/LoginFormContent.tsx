import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { setToken } from '@/utils/auth';
import { userApi } from '@/api';
import { LoginParams } from '@/types/user';

interface Props {
  onSwitchForm: (form: 'login' | 'register' | 'forgotPassword') => void;
}

export default function LoginFormContent({ onSwitchForm }: Props) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginParams>({
    username: '',
    password: '',
    isRemember: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // 1. 登录获取 token
      const res = await userApi.login(formData);
      const { accessToken } = res;
      
      // 2. 先临时保存 token 到 auth utils（这样后续请求才能带上 Authorization header）
      setToken(accessToken, formData.isRemember);
      
      // 3. 获取完整的用户信息
      const userInfo = await userApi.getUserInfo();
      
      // 4. 一次性保存 token 和用户信息到 context
      await login(accessToken, userInfo, formData.isRemember);
      
      toast.success('操作成功');
      navigate('/');
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (platform: string) => {
    toast.info(`${platform} 登录...`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      {/* 账号输入 */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="用户名"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="pl-10"
          required
        />
      </div>

      {/* 密码输入 */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="密码"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="pl-10"
          required
        />
      </div>

      {/* 记住我 & 忘记密码 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.isRemember}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isRemember: checked as boolean })
            }
          />
          <label
            htmlFor="remember"
            className="text-sm text-muted-foreground cursor-pointer select-none"
          >
            记住我
          </label>
        </div>
        <button
          type="button"
          onClick={() => onSwitchForm('forgotPassword')}
          className="text-sm text-primary hover:underline"
        >
          忘记密码
        </button>
      </div>

      {/* 登录按钮 */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '登录...' : '登录'}
      </Button>

      {/* 注册按钮 */}
      <Button
        type="button"
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => onSwitchForm('register')}
      >
        立即注册
      </Button>

      {/* 第三方登录分隔线 */}
      {/* <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          或使用第三方登录
        </span>
      </div> */}

      {/* 第三方登录按钮 */}
      {/* <div className="flex justify-center items-center gap-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleSocialLogin('微信')}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[#09bb07] to-[#02c05a] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 9.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm7 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3.5 6.5c-1.5 0-2.7-.6-3.5-1.5-.8.9-2 1.5-3.5 1.5s-2.7-.6-3.5-1.5c-.8.9-2 1.5-3.5 1.5-2.5 0-4.5-2-4.5-4.5S2.5 6 5 6c1.5 0 2.7.6 3.5 1.5.8-.9 2-1.5 3.5-1.5s2.7.6 3.5 1.5c.8-.9 2-1.5 3.5-1.5 2.5 0 4.5 2 4.5 4.5s-2 4.5-4.5 4.5z" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>微信登录</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[#24292e] to-[#1a1e22] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                <Github className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>GitHub 登录</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => handleSocialLogin('QQ')}
                className="w-11 h-11 rounded-full flex items-center justify-center bg-gradient-to-br from-[#12b7f5] to-[#0e9fe0] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21.395 15.035a39.548 39.548 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39.548 39.548 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.302-.778-.481-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673z" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>QQ 登录</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div> */}
    </form>
  );
}
