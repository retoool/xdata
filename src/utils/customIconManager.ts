import { addIcon } from "@iconify/vue/dist/offline";
import { getSvgInfo } from "@pureadmin/utils";
import { getCustomIcons } from "@/api/system/menu";

// 缓存已注册的图标名称，避免重复注册
const registeredIcons = new Set<string>();

/**
 * 加载并注册所有自定义图标
 */
export const loadCustomIcons = async () => {
  try {
    const data = await getCustomIcons();
    const customIconData = Array.isArray(data) ? data : [];
    customIconData.forEach(icon => {
      if (!registeredIcons.has(icon.iconName)) {
        // 注册到iconify离线库
        addIcon(icon.iconName, getSvgInfo(icon.svgContent));
        registeredIcons.add(icon.iconName);
        console.log("Registered custom icon:", icon.iconName);
      }
    });
    return customIconData;
  } catch (error) {
    console.warn("Failed to load custom icons:", error);
    return [];
  }
};

/**
 * 注册单个自定义图标
 */
export const registerCustomIcon = (iconName: string, svgContent: string) => {
  if (!registeredIcons.has(iconName)) {
    addIcon(iconName, getSvgInfo(svgContent));
    registeredIcons.add(iconName);
    console.log("Registered single custom icon:", iconName);
  }
};

/**
 * 清除所有已注册的图标缓存（用于重新加载）
 */
export const clearCustomIconCache = () => {
  registeredIcons.clear();
};

/**
 * 检查图标是否已注册
 */
export const isIconRegistered = (iconName: string) => {
  return registeredIcons.has(iconName);
};
