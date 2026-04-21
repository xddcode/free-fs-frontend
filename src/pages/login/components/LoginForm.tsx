import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import ForgotPasswordContent from './ForgotPasswordContent'
import LoginFormContent from './LoginFormContent'
import RegisterFormContent from './RegisterFormContent'

type FormType = 'login' | 'register' | 'forgotPassword'

export default function LoginForm() {
  const { t } = useTranslation('login')
  const [currentForm, setCurrentForm] = useState<FormType>('login')

  const formTitles: Record<FormType, string> = {
    login: t('formTitleLogin'),
    register: t('formTitleRegister'),
    forgotPassword: t('formTitleForgotPassword'),
  }

  return (
    <div className='login-form-wrapper'>
      <div className='text-2xl leading-8 font-medium text-foreground'>
        {formTitles[currentForm]}
      </div>
      <div className='mt-2 mb-1'>
        <div className='text-[15px] leading-[22px] font-medium tracking-[0.5px] text-muted-foreground'>
          {t('tagline')}
        </div>
        <div className='mt-0.5 text-[13px] leading-5 text-muted-foreground/70'>
          {t('taglineSub')}
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
