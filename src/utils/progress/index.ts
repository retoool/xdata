// // 简单的进度条实现
// class NProgressMock {
//   static start() {
//     // 可以在这里添加实际的进度条开始逻辑
//     console.log('NProgress started')
//   }

//   static done() {
//     // 可以在这里添加实际的进度条完成逻辑
//     console.log('NProgress done')
//   }
// }

// export default NProgressMock

import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  // 动画方式
  easing: "ease",
  // 递增进度条的速度
  speed: 500,
  // 是否显示加载ico
  showSpinner: false,
  // 自动递增间隔
  trickleSpeed: 200,
  // 初始化时的最小百分比
  minimum: 0.3
});

export default NProgress;
