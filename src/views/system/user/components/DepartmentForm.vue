<template>
  <div class="department-form">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="上级部门" prop="parentId">
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
      
      <el-form-item label="部门名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入部门名称"
          maxlength="50"
          show-word-limit
          clearable
        />
      </el-form-item>
      
      <el-form-item label="排序号" prop="sort">
        <el-input-number
          v-model="formData.sort"
          :min="0"
          :max="999"
          placeholder="排序号"
          style="width: 100%"
        />
      </el-form-item>
      
      <el-form-item label="部门描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入部门描述"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    
    <div class="form-footer">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ formMode === 'create' ? '创建' : '更新' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { Department, DepartmentFormData, FormMode } from '@/types/system'
import { getDepartmentTree, checkDepartmentName } from '@/api/system/department'

// Props
const props = defineProps<{
  formData: Partial<DepartmentFormData>
  formMode: FormMode
}>()

// Emits
const emit = defineEmits<{
  submit: [data: DepartmentFormData]
  cancel: []
}>()

// 响应式数据
const formRef = ref<FormInstance>()
const submitting = ref(false)
const departmentOptions = ref<Department[]>([])

const formData = reactive<DepartmentFormData>({
  id: undefined,
  name: '',
  parentId: null,
  sort: 0,
  description: '',
  status: 1
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
    { min: 2, max: 50, message: '部门名称长度为2-50个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) return callback()
        
        checkDepartmentName(
          value, 
          formData.parentId, 
          props.formMode === 'edit' ? formData.id : undefined
        )
          .then(isAvailable => {
            if (!isAvailable) {
              callback(new Error('该部门名称在当前层级下已存在'))
            } else {
              callback()
            }
          })
          .catch(() => {
            callback(new Error('部门名称验证失败'))
          })
      },
      trigger: 'blur'
    }
  ],
  sort: [
    { required: true, message: '请输入排序号', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序号范围为0-999', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    submitting.value = true
    
    // 提交表单数据
    emit('submit', { ...formData })
  } catch (error) {
    ElMessage.error('请检查表单数据')
  } finally {
    submitting.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
}

const loadDepartmentOptions = async () => {
  try {
    const data = await getDepartmentTree()
    // 过滤掉当前编辑的部门及其子部门（避免选择自己作为父级）
    if (props.formMode === 'edit' && formData.id) {
      departmentOptions.value = filterCurrentDepartment(data, formData.id)
    } else {
      departmentOptions.value = data
    }
  } catch (error) {
    ElMessage.error('加载部门列表失败')
  }
}

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

const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 监听props变化，更新表单数据
watch(() => props.formData, (newData) => {
  if (newData) {
    Object.assign(formData, {
      id: newData.id,
      name: newData.name || '',
      parentId: newData.parentId || null,
      sort: newData.sort || 0,
      description: newData.description || '',
      status: newData.status ?? 1
    })
  }
}, { immediate: true, deep: true })

// 生命周期
onMounted(() => {
  loadDepartmentOptions()
})

// 暴露方法
defineExpose({
  resetForm,
  validate: () => formRef.value?.validate(),
  clearValidate: () => formRef.value?.clearValidate()
})
</script>

<style scoped lang="scss">
.department-form {
  .form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

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
</style> 