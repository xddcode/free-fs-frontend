/**
 * Toast 工具函数
 * 基于 sonner 库的封装，提供统一的 toast 通知接口
 */

import { toast as sonnerToast } from "sonner";

export const toast = {
  /**
   * 成功提示
   */
  success: (message: string, options?: Parameters<typeof sonnerToast.success>[1]) => {
    return sonnerToast.success(message, {
      duration: 3000,
      position: "top-center",
      ...options,
    });
  },

  /**
   * 错误提示
   */
  error: (message: string, options?: Parameters<typeof sonnerToast.error>[1]) => {
    return sonnerToast.error(message, {
      duration: 4000,
      position: "top-center",
      closeButton: false,
      ...options,
    });
  },

  /**
   * 信息提示
   */
  info: (message: string, options?: Parameters<typeof sonnerToast.info>[1]) => {
    return sonnerToast.info(message, {
      duration: 3000,
      position: "top-center",
      ...options,
    });
  },

  /**
   * 警告提示
   */
  warning: (message: string, options?: Parameters<typeof sonnerToast.warning>[1]) => {
    return sonnerToast.warning(message, {
      duration: 3000,
      position: "top-center",
      ...options,
    });
  },

  /**
   * 加载提示
   */
  loading: (message: string, options?: Parameters<typeof sonnerToast.loading>[1]) => {
    return sonnerToast.loading(message, {
      position: "top-center",
      ...options,
    });
  },

  /**
   * Promise 提示
   */
  promise: sonnerToast.promise,

  /**
   * 关闭提示
   */
  dismiss: sonnerToast.dismiss,

  /**
   * 自定义提示
   */
  custom: sonnerToast.custom,
};