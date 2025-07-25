const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  // 不设置直接重定向，让路由守卫根据情况处理
  meta: {
    icon: "ep:home-filled",
    title: "首页",
    rank: 0,
    showLink: false
  },
  children: [
    {
      path: "/profile",
      name: "Profile",
      component: () => import("@/views/system/user/Profile.vue"),
      meta: {
        title: "个人详情",
        showLink: false,
      }
    },
  ]
} satisfies RouteConfigsTable;
