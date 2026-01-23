import { useState } from 'react';
import { User, Lock, Mail, Pen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { userApi } from '@/api';
import { UserRegisterParams } from '@/types/user';

interface Props {
  onSwitchForm: (form: 'login' | 'register' | 'forgotPassword') => void;
}

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

export default function RegisterFormContent({ onSwitchForm }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserRegisterParams>({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    nickname: '',
    avatar: DEFAULT_AVATAR,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 只验证密码一致性
    if (formData.password !== formData.confirmPassword) {
      toast.error('两次密码不一致');
      return;
    }

    setLoading(true);
    try {
      const registerData = {
        ...formData,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`,
      };
      await userApi.register(registerData);
      toast.success('注册成功，即将前往登录');
      setTimeout(() => {
        onSwitchForm('login');
      }, 1500);
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-8">
      {/* 账号 */}
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="账号"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="pl-10"
          disabled={loading}
          required
        />
      </div>

      {/* 密码 */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="密码"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="pl-10"
          disabled={loading}
          required
          minLength={6}
        />
      </div>

      {/* 确认密码 */}
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="password"
          placeholder="确认密码"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="pl-10"
          disabled={loading}
          required
          minLength={6}
        />
      </div>

      {/* 邮箱 */}
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="email"
          placeholder="邮箱"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="pl-10"
          disabled={loading}
          required
        />
      </div>

      {/* 昵称 */}
      <div className="relative">
        <Pen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="昵称"
          value={formData.nickname}
          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
          className="pl-10"
          disabled={loading}
        />
      </div>

      {/* 注册按钮 */}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? '注册中...' : '注册'}
      </Button>

      {/* 返回登录 */}
      <Button
        type="button"
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => onSwitchForm('login')}
        disabled={loading}
      >
        返回登录
      </Button>
    </form>
  );
}
