import { TransferSetting } from '@/types/transfer-setting'
import { UserInfo } from '@/types/user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userApi } from '@/api/user'

interface UserState {
  id: string
  username: string
  nickname: string
  email: string
  avatar: string
  status: number
  transferSetting?: TransferSetting
  setUserInfo: (userInfo: UserInfo) => void
  setTransferSetting: (setting: TransferSetting) => void
  loadTransferSetting: () => Promise<void>
  clearUserInfo: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: '',
      username: '',
      nickname: '',
      email: '',
      avatar: '',
      status: 0,
      transferSetting: undefined,
      setUserInfo: (userInfo) => set(userInfo),
      setTransferSetting: (setting) => set({ transferSetting: setting }),
      loadTransferSetting: async () => {
        try {
          const setting = await userApi.getTransferSetting()
          set({ transferSetting: setting })
        } catch (error) {
          // 如果是 404 或其他错误，设置默认值
          set({
            transferSetting: {
              userId: '',
              downloadLocation: '',
              isDefaultDownloadLocation: 1,
              downloadSpeedLimit: 0,
              concurrentUploadQuantity: 3,
              concurrentDownloadQuantity: 3,
              chunkSize: 5 * 1024 * 1024, // 5MB
            },
          })
        }
      },
      clearUserInfo: () =>
        set({
          id: '',
          username: '',
          nickname: '',
          email: '',
          avatar: '',
          status: 0,
          transferSetting: undefined,
        }),
    }),
    {
      name: 'user-storage',
    }
  )
)
