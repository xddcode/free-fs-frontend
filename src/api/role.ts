import type {
  Role,
  RoleListItem,
  CreateRoleParams,
  UpdateRoleParams,
} from '@/types/role'
import { request } from './request'

export const roleApi = {
  list: () => {
    return request.get<RoleListItem[]>('/apis/role/list')
  },

  get: (roleId: number) => {
    return request.get<Role>(`/apis/role/${roleId}`)
  },

  create: (data: CreateRoleParams) => {
    return request.post<Role>('/apis/role', data)
  },

  update: (roleId: number, data: UpdateRoleParams) => {
    return request.put<Role>(`/apis/role/${roleId}`, data)
  },

  delete: (roleId: number) => {
    return request.delete(`/apis/role/${roleId}`)
  },
}
