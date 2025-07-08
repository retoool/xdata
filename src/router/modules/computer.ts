export default [
  {
    path: "/computer",
    name: "Computer",
    redirect: "/computer/operator",
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
        path: "/computer/workflow/list",
        name: "ComputerWorkflow",
        meta: {
          title: "工作流管理"
        },
        component: () => import("@/views/computer/workflow/list/index.vue")
      },
      {
        path: "/computer/workflow/designer/:id",
        name: "ComputerWorkflowDesigner",
        meta: {
          title: "工作流设计器",
          showLink: false
        },
        component: () => import("@/views/computer/workflow/designer/index.vue")
      }
    ]
  }
] satisfies Array<RouteConfigsTable>;