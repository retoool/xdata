const Layout = () => import("@/layout/index.vue");

export default {
  path: "/example",
  name: "Example",
  component: Layout,
  redirect: "/example/theme-demo",
  meta: {
    icon: "ep:magic-stick",
    title: "示例页面",
    rank: 999
  },
  children: [
    {
      path: "/example/theme-demo",
      name: "ThemeDemo",
      component: () => import("@/views/example/ThemeDemo.vue"),
      meta: {
        title: "主题示例",
        showParent: true
      }
    }
  ]
} satisfies RouteConfigsTable; 