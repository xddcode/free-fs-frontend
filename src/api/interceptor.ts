import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from '@/components/ui/toast';
import { useAuthStore, useUserStore } from '@/stores';

export interface HttpResponse<T = unknown> {
  status: number;
  msg: string;
  code: number;
  data: T;
}

// 标记是否正在显示登出提示
let isShowingLogoutModal = false;

// 安全的 toast 调用（避免在 Toaster 未挂载时调用）
const safeToast = {
  error: (message: string, options?: any) => {
    try {
      toast.error(message, options);
    } catch (error) {
      console.error('Toast error:', message);
    }
  },
  success: (message: string, options?: any) => {
    try {
      toast.success(message, options);
    } catch (error) {
      console.log('Toast success:', message);
    }
  },
};

// 创建axios实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 store 获取 token
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器 - 统一错误处理
request.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const { data: res, config } = response;
    
    // 如果是 blob 类型的响应，直接返回
    if (config.responseType === 'blob') {
      return response;
    }
    
    // 业务状态码为 200，表示成功
    if (res.code === 200) {
      return response;
    }
    
    // 业务状态码不是 200，处理错误
    const showError = (config as any).showErrorMessage !== false;
    
    // 401/403 - 未授权或登录过期
    if ([401, 403].includes(res.code)) {
      // 避免在获取用户信息接口失败时弹窗
      if (response.config.url !== '/apis/user/info' && !isShowingLogoutModal) {
        isShowingLogoutModal = true;
        
        // 清除认证信息
        useAuthStore.getState().clearAuth();
        useUserStore.getState().resetInfo();
        
        // 显示提示
        safeToast.error('登录已过期，请重新登录', {
          duration: 3000,
        });
        
        // 延迟跳转 - 使用 hash 路由
        setTimeout(() => {
          isShowingLogoutModal = false;
          // 使用 hash 路由跳转
          window.location.hash = '#/login';
        }, 1500);
      }
    } else if (showError) {
      // 其他业务错误，显示错误信息
      safeToast.error(res.msg || '操作失败', {
        duration: 3000,
      });
    }
    
    // 构造错误对象
    const error: any = new Error(res.msg || 'Error');
    error.code = res.code;
    error.response = response;
    error.isErrorShown = showError;
    return Promise.reject(error);
  },
  (error) => {
    // HTTP 错误处理
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
          case 404:
            errorMessage = '请求的资源不存在';
            break;
          case 500:
            errorMessage = error.response.data?.msg || '服务器内部错误';
            break;
          case 502:
            errorMessage = '网关错误';
            break;
          case 503:
            errorMessage = '服务不可用';
            break;
          case 504:
            errorMessage = '网关超时';
            break;
          default:
            errorMessage = error.response.data?.msg || `请求失败(${status})`;
        }
      } else if (error.request) {
        if (error.message.includes('timeout')) {
          errorMessage = '请求超时，请检查网络连接';
        } else if (error.message.includes('Network Error')) {
          errorMessage = '网络连接失败，请检查网络';
        }
      }
      
      safeToast.error(errorMessage, {
        duration: 3000,
      });
      error.isErrorShown = true;
    }
    
    return Promise.reject(error);
  }
);

export { request };

// 便捷的请求方法封装
export const api = {
  get<T = any>(url: string, config?: any) {
    return request.get<T, AxiosResponse<HttpResponse<T>>>(url, config)
      .then((response) => response.data);
  },
  
  post<T = any>(url: string, data?: any, config?: any) {
    return request.post<T, AxiosResponse<HttpResponse<T>>>(url, data, config)
      .then((response) => response.data);
  },
  
  put<T = any>(url: string, data?: any, config?: any) {
    return request.put<T, AxiosResponse<HttpResponse<T>>>(url, data, config)
      .then((response) => response.data);
  },
  
  delete<T = any>(url: string, config?: any) {
    return request.delete<T, AxiosResponse<HttpResponse<T>>>(url, config)
      .then((response) => response.data);
  },
};
