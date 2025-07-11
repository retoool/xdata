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
      path: "/welcome",
      name: "Welcome", 
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        title: "首页",
        icon: "ep:home-filled",
        showLink: false
      }
    }
  ]
} satisfies RouteConfigsTable;
