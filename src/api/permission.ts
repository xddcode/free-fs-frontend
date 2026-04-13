import type { PermissionDef } from '@/types/permission'
import { request } from './request'

export const permissionApi = {
  list: () => {
    return request.get<PermissionDef[]>('/apis/permission/list')
  },
}
