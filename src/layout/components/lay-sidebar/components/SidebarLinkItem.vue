<script setup lang="ts">
import { computed } from "vue";
import { isUrl } from "@pureadmin/utils";
import { menuType } from "@/layout/types";

const props = defineProps<{
  to: menuType;
}>();

const isFrameLink = computed(() => (props.to.meta && (props.to.meta as any).isFrame) && isUrl(props.to.path));
const isExternalLink = computed(() => isUrl(props.to.path) && !(props.to.meta && (props.to.meta as any).isFrame));
const getLinkProps = (item: menuType) => {
  if (isFrameLink.value) {
    return {
      to: `/external/${encodeURIComponent(item.path)}`
    };
  }
  if (isExternalLink.value) {
    return {
      href: item.path,
      target: "_blank",
      rel: "noopener"
    };
  }
  return {
    to: item
  };
};
</script>

<template>
  <component
    :is="isFrameLink ? 'router-link' : isExternalLink ? 'a' : 'router-link'"
    v-bind="getLinkProps(to)"
  >
    <slot />
  </component>
</template>
