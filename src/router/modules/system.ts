import type { RouteRecordRaw } from 'vue-router'

/**
 * 系统管理路由配置
 */
const systemRoutes: RouteRecordRaw[] = [
  {
    path: '/system',
    name: 'System',
    // redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'setting',
      permission: 'system:view',
      order: 999
    },
    children: [
      {
        path: '/system/user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'user',
          permission: 'system:user:view',
          keepAlive: true
        }
      },
      {
        path: '/system/role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'user-filled',
          permission: 'system:role:view',
          keepAlive: true
        }
      },
      {
        path: '/system/menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'menu',
          permission: 'system:menu:view',
          keepAlive: true
        }
      }
    ]
  }
]

export default systemRoutes 