import { useState } from 'react';
import LoginFormContent from './LoginFormContent';
import RegisterFormContent from './RegisterFormContent';
import ForgotPasswordContent from './ForgotPasswordContent';

type FormType = 'login' | 'register' | 'forgotPassword';

export default function LoginForm() {
  const [currentForm, setCurrentForm] = useState<FormType>('login');

  const formTitles: Record<FormType, string> = {
    login: '登录',
    register: '注册',
    forgotPassword: '忘记密码',
  };

  return (
    <div className="login-form-wrapper">
      <div className="text-2xl font-medium text-foreground leading-8">
        {formTitles[currentForm]}
      </div>
      <div className="mt-2 mb-1">
        <div className="text-[15px] font-medium text-muted-foreground leading-[22px] tracking-[0.5px]">
          Free Cloud Storage
        </div>
        <div className="text-[13px] text-muted-foreground/70 leading-5 mt-0.5">
          自由云存储
        </div>
      </div>

      {currentForm === 'login' && (
        <LoginFormContent onSwitchForm={setCurrentForm} />
      )}
      {currentForm === 'register' && (
        <RegisterFormContent onSwitchForm={setCurrentForm} />
      )}
      {currentForm === 'forgotPassword' && (
        <ForgotPasswordContent onSwitchForm={setCurrentForm} />
      )}
    </div>
  );
}
