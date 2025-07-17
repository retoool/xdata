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
  ]
} satisfies RouteConfigsTable;
