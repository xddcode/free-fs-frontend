import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '@/types/user';

interface UserState {
  id: string;
  username: string;
  nickname: string;
  email: string;
  avatar: string;
  status: number;
  setUserInfo: (userInfo: UserInfo) => void;
  clearUserInfo: () => void;
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
      setUserInfo: (userInfo) => set(userInfo),
      clearUserInfo: () =>
        set({
          id: '',
          username: '',
          nickname: '',
          email: '',
          avatar: '',
          status: 0,
        }),
    }),
    {
      name: 'user-storage',
    }
  )
);
