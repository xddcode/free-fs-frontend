import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import enCommon from '@/locales/en/common.json'
import enFiles from '@/locales/en/files.json'
import enHome from '@/locales/en/home.json'
import enLayout from '@/locales/en/layout.json'
import enLogin from '@/locales/en/login.json'
import enSettings from '@/locales/en/settings.json'
import enShare from '@/locales/en/share.json'
import enStorage from '@/locales/en/storage.json'
import enTransfer from '@/locales/en/transfer.json'
import enWorkspace from '@/locales/en/workspace.json'
import zhCommon from '@/locales/zh/common.json'
import zhFiles from '@/locales/zh/files.json'
import zhHome from '@/locales/zh/home.json'
import zhLayout from '@/locales/zh/layout.json'
import zhLogin from '@/locales/zh/login.json'
import zhSettings from '@/locales/zh/settings.json'
import zhShare from '@/locales/zh/share.json'
import zhStorage from '@/locales/zh/storage.json'
import zhTransfer from '@/locales/zh/transfer.json'
import zhWorkspace from '@/locales/zh/workspace.json'

export type AppLang = 'zh' | 'en'

/** 与后端约定的 BCP 47 语言码，用于请求头 `lang` */
export type ApiLang = 'zh-CN' | 'en-US'

/** i18n 当前语言，与 `AppLang` / Select 选项一致 */
export function getAppLang(): AppLang {
  const lng = i18n.resolvedLanguage || i18n.language || 'zh'
  if (lng.startsWith('zh')) return 'zh'
  if (lng.startsWith('en')) return 'en'
  return 'zh'
}

/** 与后端约定的语言码，用于请求头 `lang`（zh-CN / en-US） */
export function getRequestLangHeader(): ApiLang {
  return getAppLang() === 'en' ? 'en-US' : 'zh-CN'
}

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        files: enFiles,
        home: enHome,
        layout: enLayout,
        login: enLogin,
        settings: enSettings,
        share: enShare,
        storage: enStorage,
        transfer: enTransfer,
        workspace: enWorkspace,
      },
      zh: {
        common: zhCommon,
        files: zhFiles,
        home: zhHome,
        layout: zhLayout,
        login: zhLogin,
        settings: zhSettings,
        share: zhShare,
        storage: zhStorage,
        transfer: zhTransfer,
        workspace: zhWorkspace,
      },
    },
    /** 默认中文；勿设置 `lng`，否则会覆盖 localStorage 里用户选的语言（如登录页切英文） */
    fallbackLng: 'zh',
    supportedLngs: ['zh', 'en'],
    load: 'languageOnly',
    ns: [
      'common',
      'files',
      'home',
      'layout',
      'login',
      'settings',
      'share',
      'storage',
      'transfer',
      'workspace',
    ],
    defaultNS: 'login',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export default i18n
