import { useState } from 'react'
import ForgotPasswordContent from './ForgotPasswordContent'
import LoginFormContent from './LoginFormContent'
import RegisterFormContent from './RegisterFormContent'

type FormType = 'login' | 'register' | 'forgotPassword'

export default function LoginForm() {
  const [currentForm, setCurrentForm] = useState<FormType>('login')

  const formTitles: Record<FormType, string> = {
    login: '登录',
    register: '注册',
    forgotPassword: '忘记密码',
  }

  return (
    <div className='login-form-wrapper'>
      <div className='text-2xl leading-8 font-medium text-foreground'>
        {formTitles[currentForm]}
      </div>
      <div className='mt-2 mb-1'>
        <div className='text-[15px] leading-[22px] font-medium tracking-[0.5px] text-muted-foreground'>
          Free Cloud Storage
        </div>
        <div className='mt-0.5 text-[13px] leading-5 text-muted-foreground/70'>
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
  )
}
