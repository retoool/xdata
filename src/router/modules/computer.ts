export default [
  {
    path: "/computer",
    name: "Computer",
    redirect: "/operator/index",
    meta: {
      title: "计算管理",
      icon: "cpu"
    },
    children: [
      {
        path: "/computer/operator",
        name: "Operator",
        meta: {
          title: "算子管理"
        },
        component: () => import("@/views/computer/operator/index.vue")
      },
      {
        path: "/computer/task",
        name: "TaskIndex",
        meta: {
          title: "任务管理"
        },
        component: () => import("@/views/computer/task/index.vue")
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;