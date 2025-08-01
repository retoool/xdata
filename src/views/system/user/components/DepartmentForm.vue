<template>
  <div class="department-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入部门名称"
          maxlength="50"
          show-word-limit
          clearable
        />
      </el-form-item>
      
      <el-form-item v-if="showParentSelect" label="上级部门" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="departmentOptions"
          :props="treeSelectProps"
          placeholder="选择上级部门（为空表示顶级部门）"
          clearable
          check-strictly
          :render-after-expand="false"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Department, DepartmentFormData } from '../types/department'
import { getDepartmentTree } from '@/api/system/department'

// Props
const props = defineProps<{
  formData: Partial<DepartmentFormData>
  formMode: FormMode
  showParentSelect?: boolean
}>()

// Emits
const emit = defineEmits<{
  cancel: [];
}>();

// 响应式数据
const formRef = ref<FormInstance>()
const departmentOptions = ref<Department[]>([])

const formData = reactive<DepartmentFormData>({
  id: undefined,
  name: '',
  parentId: null
})

const treeSelectProps = {
  value: 'id',
  label: 'name',
  children: 'children'
}

// 表单验证规则
const formRules: FormRules<DepartmentFormData> = {
  name: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '部门名称长度为2-50个字符', trigger: 'blur' }
  ]
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return Promise.reject(new Error("表单未初始化"))
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 准备提交数据
    const submitData = { ...formData }
    
    return Promise.resolve(submitData)
  } catch (error: any) {
    console.error("提交失败:", error)
    return Promise.reject(error)
  } finally {
    submitting.value = false
  }
}

// 添加 submitting 状态
const submitting = ref(false)

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 暴露方法给父组件
defineExpose({
  submitForm,
  formRef,
  resetForm,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
})

// 加载部门选项
const loadDepartmentOptions = async () => {
  try {
    const data = await getDepartmentTree()
    if (props.formMode === 'edit' && formData.id) {
      departmentOptions.value = filterCurrentDepartment(data, formData.id)
    } else {
      departmentOptions.value = data
    }
  } catch (error) {
    ElMessage.error('加载部门列表失败')
  }
}

// 过滤当前部门
const filterCurrentDepartment = (departments: Department[], currentId: number): Department[] => {
  return departments.filter(dept => {
    if (dept.id === currentId) {
      return false
    }
    if (dept.children && dept.children.length > 0) {
      dept.children = filterCurrentDepartment(dept.children, currentId)
    }
    return true
  })
}

// 监听props变化，更新表单数据
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      id: newData.id,
      name: newData.name || '',
      parentId: newData.parentId || null
    })
  }
}, { immediate: true, deep: true })

// 生命周期
onMounted(() => {
  if (props.showParentSelect) {
    loadDepartmentOptions()
  }
})
</script>

<style scoped lang="scss">
.department-form {
  padding: 16px;
}

// 表单组件统一样式
:deep(.el-form) {
  .el-form-item__label {
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
  
  .el-input__wrapper {
    border-radius: 4px;
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    transition: all 0.2s ease;
    
    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary-light-5) inset;
    }
    
    &.is-focused {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
  
  .el-select {
    .el-input__wrapper {
      border-radius: 4px;
    }
  }
}

// 树形选择器样式
:deep(.el-tree-select) {
  .el-select__wrapper {
    box-shadow: 0 0 0 1px var(--el-border-color) inset;
    
    &:hover {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
    
    &.is-focused {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset;
    }
  }
}

// 数字输入框样式
:deep(.el-input-number) {
  .el-input__wrapper {
    border-radius: 4px;
  }
}

// 单选框样式
:deep(.el-radio) {
  .el-radio__label {
    color: var(--el-text-color-regular);
  }
  
  .el-radio__input.is-checked {
    .el-radio__inner {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary);
    }
  }
}
</style> 