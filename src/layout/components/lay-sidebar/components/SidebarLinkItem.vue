<script setup lang="ts">
import { computed } from "vue";
import { isUrl } from "@pureadmin/utils";
import { menuType } from "@/layout/types";

const props = defineProps<{
  to: menuType;
}>();

const isIframeLink = computed(
  () => 
    isUrl(props.to.meta?.frameSrc) && props.to.meta?.isIframe
);
const isExternalLink = computed(
  () =>
    isUrl(props.to.meta?.frameSrc) && !props.to.meta?.isIframe
);
const getLinkProps = (item: menuType) => {
  // if (isIframeLink.value) {
  //   return {
  //     to: `/external/${encodeURIComponent(item.path)}`
  //   };
  // }
  if (isExternalLink.value) {
    return {
      href: item.meta?.frameSrc,
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
    :is="isIframeLink ? 'router-link' : isExternalLink ? 'a' : 'router-link'"
    v-bind="getLinkProps(to)"
  >
    <slot />
  </component>
</template>
