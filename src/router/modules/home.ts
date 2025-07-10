const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "Home",
  component: Layout,
  // 删除重定向，让路由守卫处理默认路由
  meta: {
    icon: "ep:home-filled", 
    title: "首页",
    rank: 0
  }
  // 删除children，让后端提供welcome路由
} satisfies RouteConfigsTable;
