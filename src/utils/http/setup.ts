import { PureHttp } from './index'
import { useUserStore } from '@/store/modules/user'
import { getToken } from '@/utils/auth'

/**
 * 初始化HTTP工具配置
 * 需要在应用启动时调用
 */
export function setupHttpConfig() {
  PureHttp.setTokenHandlers({
    getToken: () => getToken(),

    refreshToken: async (refreshToken: string) => {
      const userStore = useUserStore()
      return userStore.handRefreshToken({ refreshToken })
    },

    onTokenExpired: () => {
      const userStore = useUserStore()
      userStore.logout()

      // 如果需要跳转到登录页，可以在这里处理
      // 例如：router.push('/login')
      console.warn('Token已过期，请重新登录')
    }
  })
}

export default setupHttpConfig 