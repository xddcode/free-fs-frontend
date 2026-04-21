import type { Workspace } from '@/types/workspace'
import type { UserRolePermissions } from '@/types/user'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WorkspaceState {
  workspaces: Workspace[]
  currentWorkspaceId: string | null
  currentRole: UserRolePermissions | null

  setWorkspaces: (list: Workspace[]) => void
  setCurrentWorkspaceId: (id: string | null) => void
  setCurrentRole: (role: UserRolePermissions | null) => void
  clear: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      workspaces: [],
      currentWorkspaceId: null,
      currentRole: null,

      setWorkspaces: (workspaces) => set({ workspaces }),

      setCurrentWorkspaceId: (id) => set({ currentWorkspaceId: id }),

      setCurrentRole: (role) => set({ currentRole: role }),

      clear: () =>
        set({
          workspaces: [],
          currentWorkspaceId: null,
          currentRole: null,
        }),
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        currentWorkspaceId: state.currentWorkspaceId,
      }),
    }
  )
)

export const getCurrentWorkspaceId = (): string | null =>
  useWorkspaceStore.getState().currentWorkspaceId

export const getCurrentSlug = (): string | null => {
  const { workspaces, currentWorkspaceId } = useWorkspaceStore.getState()
  return workspaces.find((w) => w.id === currentWorkspaceId)?.slug ?? null
}

export const findBySlug = (slug: string): Workspace | undefined =>
  useWorkspaceStore.getState().workspaces.find((w) => w.slug === slug)
