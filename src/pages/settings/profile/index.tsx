import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>个人资料</h3>
        <p className='text-sm text-muted-foreground'>管理您的个人资料信息</p>
      </div>
      <div className='my-4 border-t' />
      <div className='flex-1'>
        <div className='max-w-2xl'>
          <ProfileForm />
        </div>
      </div>
    </div>
  )
}