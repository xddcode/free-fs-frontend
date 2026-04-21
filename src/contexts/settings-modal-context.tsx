import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type SettingsTab =
  | 'profile'
  | 'appearance'
  | 'transfer'
  | 'workspace'
  | 'members'
  | 'roles'

type SettingsModalValue = {
  open: boolean
  setOpen: (open: boolean) => void
  tab: SettingsTab
  setTab: (tab: SettingsTab) => void
  /** 打开设置；可指定初始面板，默认个人资料 */
  openSettings: (tab?: SettingsTab) => void
}

const SettingsModalContext = createContext<SettingsModalValue | null>(null)

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<SettingsTab>('profile')

  const openSettings = useCallback((next?: SettingsTab) => {
    if (next) setTab(next)
    setOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      open,
      setOpen,
      tab,
      setTab,
      openSettings,
    }),
    [open, tab, openSettings]
  )

  return (
    <SettingsModalContext.Provider value={value}>
      {children}
    </SettingsModalContext.Provider>
  )
}

export function useSettingsModal() {
  const ctx = useContext(SettingsModalContext)
  if (!ctx) {
    throw new Error('useSettingsModal 须在 SettingsModalProvider 内使用')
  }
  return ctx
}
