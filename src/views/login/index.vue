<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import { ref, reactive, toRaw } from "vue";
import { debounce } from "@pureadmin/utils";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import type { FormInstance } from "element-plus";
import { useLayout } from "@/layout/hooks/useLayout";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg, avatar } from "./utils/static";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { PasswordCrypto } from "@/utils/crypto";
import { useUserStoreHook } from "@/store/modules/user";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Lock from "~icons/ri/lock-fill";
import User from "~icons/ri/user-3-fill";
import { onMounted } from "vue";
import Cookies from "js-cookie";

defineOptions({
  name: "Login"
});

const router = useRouter();
const loading = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);
const { title } = useNav();

const ruleForm = reactive({
  username: "admin",
  password: "admin@123"
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;

      // 检查公钥是否已设置
      if (!PasswordCrypto.isPublicKeySet()) {
        message("系统错误：公钥未设置", { type: "error" });
        loading.value = false;
        return;
      }

      // 加密密码
      let encryptedPassword;
      try {
        encryptedPassword = PasswordCrypto.encryptPassword(ruleForm.password);
      } catch (error) {
        message("密码加密失败", { type: "error" });
        loading.value = false;
        return;
      }

      useUserStoreHook()
        .login({
          username: ruleForm.username,
          password: encryptedPassword
        })
        .then(res => {
          // 获取后端路由
          return initRouter().then(() => {
            disabled.value = true;
            // 获取首页路径，如果获取失败则使用默认路径
            const topMenu = getTopMenu(true);
            const targetPath = topMenu?.path || "/welcome";
            router
              .push(targetPath)
              .then(() => {
                message("登录成功", { type: "success" });
              })
              .catch(error => {
                console.error("top路由跳转失败:", error);
                // 如果跳转失败，尝试跳转到根路径
                router
                  .push("/")
                  .then(() => {
                    message("登录成功", { type: "success" });
                  })
                  .catch(err => {
                    console.error("备用根路由跳转也失败:", err);
                    message("登录成功，但页面跳转失败", { type: "warning" });
                  });
              })
              .finally(() => (disabled.value = false));
          });
        })
        .catch(error => {
          console.error("登录失败:", error);
          message("登录失败: " + (error.message || "未知错误"), {
            type: "error"
          });
        })
        .finally(() => (loading.value = false));
    }
  });
};

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keydown", ({ code }) => {
  if (
    ["Enter", "NumpadEnter"].includes(code) &&
    !disabled.value &&
    !loading.value
  )
    immediateDebounce(ruleFormRef.value);
});

onMounted(async () => {
  // 清理所有登录状态，确保显示登录页面
  Cookies.remove("multiple-tabs");
  localStorage.removeItem("user-info");
  localStorage.removeItem("userInfo");
  localStorage.removeItem("roles");
  localStorage.removeItem("permissions");
  localStorage.removeItem("menuList");
  localStorage.removeItem("authorized-token");

  // 清理用户store状态
  const userStore = useUserStoreHook();
  userStore.logout();

  // 获取RSA公钥
  try {
    const response = await fetch("/api/v1/public-key");
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data.publicKey) {
        PasswordCrypto.setPublicKey(data.data.publicKey);
        console.log("RSA公钥设置成功");
      } else {
        console.error("获取公钥失败：", data.message);
        message("获取公钥失败，请刷新页面重试", { type: "error" });
      }
    } else {
      console.error("获取公钥请求失败：", response.status);
      message("获取公钥失败，请刷新页面重试", { type: "error" });
    }
  } catch (error) {
    console.error("获取公钥异常：", error);
    message("获取公钥失败，请刷新页面重试", { type: "error" });
  }
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
    </div>
    <div class="login-container">
      <div class="login-box">
        <div class="login-form">
          <div class="avatar-container">
            <img :src="avatar" class="avatar" />
            <span class="avatar-text">{{ title }}</span>
          </div>
          <!-- <Motion>
            <h2 class="outline-hidden">{{ title }}</h2>
          </Motion> -->

          <el-form
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: '请输入账号',
                    trigger: 'blur'
                  }
                ]"
                prop="username"
              >
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  placeholder="账号"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  placeholder="密码"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button
                class="w-full mt-4!"
                size="default"
                type="primary"
                :loading="loading"
                :disabled="disabled"
                @click="onLogin(ruleFormRef)"
              >
                登录
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}
</style>
