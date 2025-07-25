// 这里存放本地图标，在 src/layout/index.vue 文件中加载，避免在首启动加载
import { getSvgInfo } from "@pureadmin/utils";
import { addIcon } from "@iconify/vue/dist/offline";

// 手动导入常用图标（确保功能正常）
import EpHomeFilled from "~icons/ep/home-filled?raw";
import EpUser from "~icons/ep/user?raw";
import EpSetting from "~icons/ep/setting?raw";
import EpMenu from "~icons/ep/menu?raw";
import EpDocument from "~icons/ep/document?raw";
import EpFolder from "~icons/ep/folder?raw";
import EpLink from "~icons/ep/link?raw";
import EpView from "~icons/ep/view?raw";
import EpEdit from "~icons/ep/edit?raw";
import EpDelete from "~icons/ep/delete?raw";
import EpPlus from "~icons/ep/plus?raw";
import EpSearch from "~icons/ep/search?raw";
import EpRefresh from "~icons/ep/refresh?raw";
import EpDownload from "~icons/ep/download?raw";
import EpUpload from "~icons/ep/upload?raw";
import EpStar from "~icons/ep/star?raw";
import EpInfoFilled from "~icons/ep/info-filled?raw";
import EpWarning from "~icons/ep/warning?raw";
import EpCircleCheck from "~icons/ep/circle-check?raw";
import EpCircleClose from "~icons/ep/circle-close?raw";
import EpCalendar from "~icons/ep/calendar?raw";
import EpClock from "~icons/ep/clock?raw";
import EpLocation from "~icons/ep/location?raw";
import EpPhone from "~icons/ep/phone?raw";
import EpMessage from "~icons/ep/message?raw";
import EpNotification from "~icons/ep/notification?raw";
import EpLock from "~icons/ep/lock?raw";
import EpKey from "~icons/ep/key?raw";
import EpTools from "~icons/ep/tools?raw";
import EpMonitor from "~icons/ep/monitor?raw";
import EpDataBoard from "~icons/ep/data-board?raw";
import EpTrendCharts from "~icons/ep/trend-charts?raw";
import EpPieChart from "~icons/ep/pie-chart?raw";
import EpHistogram from "~icons/ep/histogram?raw";
import EpGrid from "~icons/ep/grid?raw";
import EpList from "~icons/ep/list?raw";
import EpCollection from "~icons/ep/collection?raw";
import EpFiles from "~icons/ep/files?raw";
import EpPicture from "~icons/ep/picture?raw";
import EpVideoPlay from "~icons/ep/video-play?raw";
import EpHeadset from "~icons/ep/headset?raw";
import EpMicrophone from "~icons/ep/microphone?raw";
import EpCamera from "~icons/ep/camera?raw";
import EpVideoCamera from "~icons/ep/video-camera?raw";
import EpPrinter from "~icons/ep/printer?raw";
import EpShare from "~icons/ep/share?raw";
import EpConnection from "~icons/ep/connection?raw";
import EpCpu from "~icons/ep/cpu?raw";
import EpSunny from "~icons/ep/sunny?raw";
import EpMoon from "~icons/ep/moon?raw";
import EpUmbrella from "~icons/ep/umbrella?raw";
import EpPartlyCloudy from "~icons/ep/partly-cloudy?raw";
import EpLightning from "~icons/ep/lightning?raw";
import EpSunrise from "~icons/ep/sunrise?raw";
import EpSunset from "~icons/ep/sunset?raw";

import RiHomeSmileLine from "~icons/ri/home-smile-line?raw";
import RiSearchLine from "~icons/ri/search-line?raw";
import RiInformationLine from "~icons/ri/information-line?raw";
import RiUserLine from "~icons/ri/user-line?raw";
import RiSettingsLine from "~icons/ri/settings-line?raw";
import RiMenuLine from "~icons/ri/menu-line?raw";
import RiFileLine from "~icons/ri/file-line?raw";
import RiFolderLine from "~icons/ri/folder-line?raw";
import RiLink from "~icons/ri/link?raw";
import RiEyeLine from "~icons/ri/eye-line?raw";
import RiEditLine from "~icons/ri/edit-line?raw";
import RiDeleteBinLine from "~icons/ri/delete-bin-line?raw";
import RiAddLine from "~icons/ri/add-line?raw";
import RiRefreshLine from "~icons/ri/refresh-line?raw";
import RiDownloadLine from "~icons/ri/download-line?raw";
import RiUploadLine from "~icons/ri/upload-line?raw";
import RiStarLine from "~icons/ri/star-line?raw";
import RiAlertLine from "~icons/ri/alert-line?raw";
import RiCheckLine from "~icons/ri/check-line?raw";
import RiCloseLine from "~icons/ri/close-line?raw";
import RiCalendarLine from "~icons/ri/calendar-line?raw";
import RiTimeLine from "~icons/ri/time-line?raw";
import RiMapPinLine from "~icons/ri/map-pin-line?raw";
import RiPhoneLine from "~icons/ri/phone-line?raw";
import RiMessageLine from "~icons/ri/message-line?raw";
import RiNotificationLine from "~icons/ri/notification-line?raw";
import RiLockLine from "~icons/ri/lock-line?raw";
import RiKeyLine from "~icons/ri/key-line?raw";
import RiToolsLine from "~icons/ri/tools-line?raw";
import RiComputerLine from "~icons/ri/computer-line?raw";
import RiDashboardLine from "~icons/ri/dashboard-line?raw";
import RiBarChartLine from "~icons/ri/bar-chart-line?raw";
import RiPieChartLine from "~icons/ri/pie-chart-line?raw";
import RiLineChartLine from "~icons/ri/line-chart-line?raw";
import RiGridLine from "~icons/ri/grid-line?raw";
import RiListCheck from "~icons/ri/list-check?raw";
import RiDatabaseLine from "~icons/ri/database-line?raw";
import RiImageLine from "~icons/ri/image-line?raw";
import RiVideoLine from "~icons/ri/video-line?raw";
import RiHeadphoneLine from "~icons/ri/headphone-line?raw";
import RiMicLine from "~icons/ri/mic-line?raw";
import RiCameraLine from "~icons/ri/camera-line?raw";
import RiVideoAddLine from "~icons/ri/video-add-line?raw";
import RiPrinterLine from "~icons/ri/printer-line?raw";
import RiShareLine from "~icons/ri/share-line?raw";
import RiWifiLine from "~icons/ri/wifi-line?raw";
import RiServerLine from "~icons/ri/server-line?raw";
import RiSunLine from "~icons/ri/sun-line?raw";
import RiMoonLine from "~icons/ri/moon-line?raw";
import RiUmbrellaLine from "~icons/ri/umbrella-line?raw";
import RiCloudyLine from "~icons/ri/cloudy-line?raw";
import RiThunderstormsLine from "~icons/ri/thunderstorms-line?raw";

export const icons: [string, any][] = [
  // Element Plus Icons
  ["ep/home-filled", EpHomeFilled],
  ["ep/user", EpUser],
  ["ep/setting", EpSetting],
  ["ep/menu", EpMenu],
  ["ep/document", EpDocument],
  ["ep/folder", EpFolder],
  ["ep/link", EpLink],
  ["ep/view", EpView],
  ["ep/edit", EpEdit],
  ["ep/delete", EpDelete],
  ["ep/plus", EpPlus],
  ["ep/search", EpSearch],
  ["ep/refresh", EpRefresh],
  ["ep/download", EpDownload],
  ["ep/upload", EpUpload],
  ["ep/star", EpStar],
  ["ep/info-filled", EpInfoFilled],
  ["ep/warning", EpWarning],
  ["ep/circle-check", EpCircleCheck],
  ["ep/circle-close", EpCircleClose],
  ["ep/calendar", EpCalendar],
  ["ep/clock", EpClock],
  ["ep/location", EpLocation],
  ["ep/phone", EpPhone],
  ["ep/message", EpMessage],
  ["ep/notification", EpNotification],
  ["ep/lock", EpLock],
  ["ep/key", EpKey],
  ["ep/tools", EpTools],
  ["ep/monitor", EpMonitor],
  ["ep/data-board", EpDataBoard],
  ["ep/trend-charts", EpTrendCharts],
  ["ep/pie-chart", EpPieChart],
  ["ep/histogram", EpHistogram],
  ["ep/grid", EpGrid],
  ["ep/list", EpList],
  ["ep/collection", EpCollection],
  ["ep/files", EpFiles],
  ["ep/picture", EpPicture],
  ["ep/video-play", EpVideoPlay],
  ["ep/headset", EpHeadset],
  ["ep/microphone", EpMicrophone],
  ["ep/camera", EpCamera],
  ["ep/video-camera", EpVideoCamera],
  ["ep/printer", EpPrinter],
  ["ep/share", EpShare],
  ["ep/connection", EpConnection],
  ["ep/cpu", EpCpu],
  ["ep/sunny", EpSunny],
  ["ep/moon", EpMoon],
  ["ep/umbrella", EpUmbrella],
  ["ep/partly-cloudy", EpPartlyCloudy],
  ["ep/lightning", EpLightning],
  ["ep/sunrise", EpSunrise],
  ["ep/sunset", EpSunset],

  // Remix Icons
  ["ri/home-smile-line", RiHomeSmileLine],
  ["ri/search-line", RiSearchLine],
  ["ri/information-line", RiInformationLine],
  ["ri/user-line", RiUserLine],
  ["ri/settings-line", RiSettingsLine],
  ["ri/menu-line", RiMenuLine],
  ["ri/file-line", RiFileLine],
  ["ri/folder-line", RiFolderLine],
  ["ri/link", RiLink],
  ["ri/eye-line", RiEyeLine],
  ["ri/edit-line", RiEditLine],
  ["ri/delete-bin-line", RiDeleteBinLine],
  ["ri/add-line", RiAddLine],
  ["ri/refresh-line", RiRefreshLine],
  ["ri/download-line", RiDownloadLine],
  ["ri/upload-line", RiUploadLine],
  ["ri/star-line", RiStarLine],
  ["ri/alert-line", RiAlertLine],
  ["ri/check-line", RiCheckLine],
  ["ri/close-line", RiCloseLine],
  ["ri/calendar-line", RiCalendarLine],
  ["ri/time-line", RiTimeLine],
  ["ri/map-pin-line", RiMapPinLine],
  ["ri/phone-line", RiPhoneLine],
  ["ri/message-line", RiMessageLine],
  ["ri/notification-line", RiNotificationLine],
  ["ri/lock-line", RiLockLine],
  ["ri/key-line", RiKeyLine],
  ["ri/tools-line", RiToolsLine],
  ["ri/computer-line", RiComputerLine],
  ["ri/dashboard-line", RiDashboardLine],
  ["ri/bar-chart-line", RiBarChartLine],
  ["ri/pie-chart-line", RiPieChartLine],
  ["ri/line-chart-line", RiLineChartLine],
  ["ri/grid-line", RiGridLine],
  ["ri/list-check", RiListCheck],
  ["ri/database-line", RiDatabaseLine],
  ["ri/image-line", RiImageLine],
  ["ri/video-line", RiVideoLine],
  ["ri/headphone-line", RiHeadphoneLine],
  ["ri/mic-line", RiMicLine],
  ["ri/camera-line", RiCameraLine],
  ["ri/video-add-line", RiVideoAddLine],
  ["ri/printer-line", RiPrinterLine],
  ["ri/share-line", RiShareLine],
  ["ri/wifi-line", RiWifiLine],
  ["ri/server-line", RiServerLine],
  ["ri/sun-line", RiSunLine],
  ["ri/moon-line", RiMoonLine],
  ["ri/umbrella-line", RiUmbrellaLine],
  ["ri/cloudy-line", RiCloudyLine],
  ["ri/thunderstorms-line", RiThunderstormsLine]
];

// 注册所有图标
icons.forEach(([name, icon]) => {
  addIcon(name, getSvgInfo(icon));
});
