import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>账户设置</h3>
        <p className='text-sm text-muted-foreground'>管理您的账户安全设置，包括密码和邮箱</p>
      </div>
      <div className='my-4 border-t' />
      <div className='flex-1'>
        <div className='max-w-2xl'>
          <AccountForm />
        </div>
      </div>
    </div>
  )
}
