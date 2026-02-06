import { TransferForm } from './transfer-form'

export function SettingsTransfer() {
  return (
    <div className='flex flex-1 flex-col'>
      <div className='flex-none'>
        <h3 className='text-lg font-medium'>传输设置</h3>
        <p className='text-sm text-muted-foreground'>
          配置文件上传和下载的相关设置
        </p>
      </div>
      <div className='my-4 border-t' />
      <div className='flex-1'>
        <div className='max-w-2xl'>
          <TransferForm />
        </div>
      </div>
    </div>
  )
}
