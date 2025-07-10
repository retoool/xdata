// 异步路由 Mock 数据
import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  {
    url: "/get-async-routes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: [
          {
            path: "/",
            name: "Home",
            component: "Layout",
            redirect: "/welcome",
            meta: {
              title: "首页",
              icon: "HomeFilled",
              rank: 0
            },
            children: [
              {
                path: "/welcome",
                name: "Welcome",
                component: "/src/views/welcome/index",
                meta: {
                  title: "首页",
                  icon: "HomeFilled",
                  rank: 0
                }
              }
            ]
          },
          {
            path: "/system",
            name: "System",
            component: "Layout",
            redirect: "/system/menu",
            meta: {
              title: "系统管理",
              icon: "Setting",
              rank: 999
            },
            children: [
              {
                path: "/system/menu",
                name: "SystemMenu",
                component: "/src/views/system/menu/index",
                meta: {
                  title: "菜单管理",
                  icon: "Menu",
                  rank: 1
                }
              }
            ]
          }
        ]
      };
    }
  }
]); 