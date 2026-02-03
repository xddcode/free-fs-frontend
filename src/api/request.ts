import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getToken, clearToken } from '@/utils/auth';
import { toast } from 'sonner';

export interface HttpResponse<T = unknown> {
  status: number;
  msg: string;
  code: number;
  data: T;
}

let isShowingLogoutModal = false;
let logoutDialogCallback: (() => void) | null = null;

// 设置登录过期回调
export const setLogoutCallback = (callback: () => void) => {
  logoutDialogCallback = callback;
};

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

const getCurrentStoragePlatformId = (): string | null => {
  const storageInfo = localStorage.getItem('current-storage-platform');
  if (storageInfo) {
    try {
      const platform = JSON.parse(storageInfo);
      return platform?.settingId || null;
    } catch (error) {
      return null;
    }
  }
  return null;
};

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    const platformId = getCurrentStoragePlatformId();
    if (platformId) {
      config.headers = config.headers || {};
      config.headers['X-Storage-Platform-Config-Id'] = platformId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

service.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const { data: res, config } = response;

    if (config.responseType === 'blob') {
      return response;
    }

    if (res.code === 200) {
      return response;
    }

    const showError = (config as any).showErrorMessage !== false;

    if ([401, 403].includes(res.code)) {
      if (response.config.url !== '/apis/user/info' && !isShowingLogoutModal) {
        isShowingLogoutModal = true;
        if (logoutDialogCallback) {
          logoutDialogCallback();
        } else {
          // 降级方案：如果没有设置回调，使用 toast
          toast.error('登录已过期，请重新登录');
          setTimeout(() => {
            clearToken();
            localStorage.removeItem('userInfo');
            sessionStorage.removeItem('userInfo');
            window.location.href = '/login';
            isShowingLogoutModal = false;
          }, 1500);
        }
      }
    } else if (showError) {
      toast.error(res.msg || '操作失败');
    }

    const error: any = new Error(res.msg || 'Error');
    error.code = res.code;
    error.response = response;
    return Promise.reject(error);
  },
  (error) => {
    const config = error.config || {};
    const showError = (config as any).showErrorMessage !== false;

    if (showError && !error.isErrorShown) {
      let errorMessage = '网络请求失败';

      if (error.response) {
        const { status } = error.response;
        switch (status) {
          case 400:
            errorMessage = error.response.data?.msg || '请求参数错误';
            break;
          case 401:
          case 403:
            errorMessage = '登录已过期，请重新登录';
            if (!isShowingLogoutModal) {
              isShowingLogoutModal = true;
              if (logoutDialogCallback) {
                logoutDialogCallback();
              } else {
                // 降级方案
                setTimeout(() => {
                  clearToken();
                  localStorage.removeItem('userInfo');
                  sessionStorage.removeItem('userInfo');
                  window.location.href = '/login';
                  isShowingLogoutModal = false;
                }, 1500);
              }
            }
            break;
          case 404:
            errorMessage = '请求的资源不存在';
            break;
          case 500:
            errorMessage = error.response.data?.msg || '服务器内部错误';
            break;
          default:
            errorMessage = error.response.data?.msg || `请求失败(${status})`;
        }
      } else if (error.message.includes('timeout')) {
        errorMessage = '请求超时，请检查网络连接';
      } else if (error.message.includes('Network Error')) {
        errorMessage = '网络连接失败，请检查网络';
      }

      toast.error(errorMessage);
    }

    return Promise.reject(error);
  }
);

export const request = {
  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return service
      .get<T, AxiosResponse<HttpResponse<T>>>(url, config)
      .then((response) => response.data.data);
  },

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return service
      .post<T, AxiosResponse<HttpResponse<T>>>(url, data, config)
      .then((response) => response.data.data);
  },

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return service
      .put<T, AxiosResponse<HttpResponse<T>>>(url, data, config)
      .then((response) => response.data.data);
  },

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return service
      .delete<T, AxiosResponse<HttpResponse<T>>>(url, config)
      .then((response) => response.data.data);
  },
};

export default service;
