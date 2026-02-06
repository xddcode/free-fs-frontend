import { AppearanceForm } from './appearance-form'

export function SettingsAppearance() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>外观</h3>
        <p className='text-sm text-muted-foreground'>
          自定义应用的外观，在明亮和暗黑主题之间切换
        </p>
      </div>
      <div className='my-4 border-t' />
      <div className='flex-1'>
        <div className='max-w-2xl'>
          <AppearanceForm />
        </div>
      </div>
    </div>
  )
}
