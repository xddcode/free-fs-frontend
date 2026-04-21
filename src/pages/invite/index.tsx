import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { invitationApi } from '@/api/invitation'
import { userApi } from '@/api/user'
import { useAuth } from '@/contexts/auth-context'
import { useWorkspaceStore } from '@/store/workspace'
import type { InvitationDetail } from '@/types/invitation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Mail, Building2, UserCheck, AlertCircle, Clock } from 'lucide-react'

export default function InvitePage() {
  const { t } = useTranslation('invite')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isAuthenticated, user, loadWorkspaces, activateWorkspace } = useAuth()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState<InvitationDetail | null>(null)
  const [error, setError] = useState<string>('')
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    if (!token) {
      setError(t('invalidLink'))
      setLoading(false)
      return
    }

    loadInvitation()
  }, [token])

  // 加载邀请信息
  const loadInvitation = async () => {
    try {
      setLoading(true)
      const invitationData = await invitationApi.verifyInvitation(token!)

      setInvitation(invitationData)

      // 根据用户是否存在，决定下一步操作
      handleInvitationFlow(invitationData)
    } catch (err: any) {
      setError(err.message || t('verifyFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 处理邀请流程
  const handleInvitationFlow = (invitationData: InvitationDetail) => {
    // 情况1：用户不存在，需要注册
    if (!invitationData.userExists) {
      // 跳转到注册页面，携带邀请信息
      navigate(
        `/login?type=register&token=${token}&email=${encodeURIComponent(invitationData.email)}`
      )
      return
    }

    // 情况2：用户已存在但未登录
    if (!isAuthenticated) {
      // 未登录，引导登录
      navigate(
        `/login?redirect=${encodeURIComponent(`/invite?token=${token}`)}&email=${encodeURIComponent(invitationData.email)}`
      )
      return
    }

    // 情况3：已登录，验证邮箱是否匹配
    if (user?.email !== invitationData.email) {
      setError(
        t('emailMismatch', {
          currentEmail: user?.email,
          inviteEmail: invitationData.email,
        })
      )
      return
    }

    // 邮箱匹配，可以接受邀请
  }

  // 接受邀请
  const handleAcceptInvitation = async () => {
    if (!token) return

    try {
      setAccepting(true)
      await invitationApi.acceptInvitation(token)

      toast.success(t('acceptSuccess'))

      // 接受成功，刷新工作空间列表（因为用户刚加入新工作空间）
      const hasWorkspaces = await loadWorkspaces()
      
      if (hasWorkspaces) {
        // 获取最新的工作空间列表
        const { workspaces, currentWorkspaceId } = useWorkspaceStore.getState()
        
        // 如果当前没有激活的工作空间，或者工作空间列表发生变化，激活第一个
        if (!currentWorkspaceId || workspaces.length > 0) {
          const targetWorkspace = workspaces[0]
          if (targetWorkspace) {
            await activateWorkspace(targetWorkspace.id)
            // 跳转到新加入的工作空间
            navigate(`/w/${targetWorkspace.slug}/`, { replace: true })
            return
          }
        }
      }
      
      // 兜底：跳转到首页（会触发 RootRedirect）
      navigate('/', { replace: true })
    } catch (err: any) {
      toast.error(err.message || t('acceptFailed'))
    } finally {
      setAccepting(false)
    }
  }

  // 渲染加载状态
  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4 md:p-8">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    )
  }

  // 渲染错误状态
  if (error) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4 md:p-8">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute top-1/2 left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-100/50 blur-[120px]" />
        <Card className="relative z-10 w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{t('invalidInvite')}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={() => navigate('/')} className="mt-4">
              {t('backToHome')}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // 渲染邀请详情
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50 p-4 md:p-8">
      {/* 点阵背景 */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(#e2e8f0 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 装饰性背景光晕 */}
      <div className="absolute top-1/2 left-1/2 z-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/50 blur-[120px]" />

      <Card className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-white/60 bg-white/85 p-0 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        {/* 顶部装饰条 */}
        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-8">
          {/* 标题 */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {t('workspaceInvitation')}
            </h1>
          </div>

          {/* 邀请信息 */}
          <div className="space-y-4">
            {/* 邀请人 */}
            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
              <UserCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('invitedBy')}</p>
                <p className="text-base font-semibold">{invitation?.inviterName}</p>
              </div>
            </div>

            {/* 工作空间 */}
            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
              <Building2 className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('joinWorkspace')}</p>
                <p className="text-base font-semibold">{invitation?.workspaceName}</p>
              </div>
            </div>

            {/* 角色 */}
            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
              <UserCheck className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('yourRole')}</p>
                <p className="text-base font-semibold">{invitation?.roleName}</p>
              </div>
            </div>

            {/* 邀请邮箱 */}
            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
              <Mail className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('inviteEmail')}</p>
                <p className="text-base font-semibold">{invitation?.email}</p>
              </div>
            </div>

            {/* 有效期 */}
            <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
              <Clock className="mt-0.5 h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{t('expiresAt')}</p>
                <p className="text-base font-semibold">
                  {invitation?.expiresAt
                    ? new Date(invitation.expiresAt).toLocaleString()
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="mt-8 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/')}
              disabled={accepting}
            >
              {t('cancel')}
            </Button>
            <Button
              className="flex-1"
              onClick={handleAcceptInvitation}
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('processing')}
                </>
              ) : (
                t('acceptInvite')
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
