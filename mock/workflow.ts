import { MockMethod } from "vite-plugin-mock";

// 工作流状态
const statuses = ['draft', 'published', 'running', 'stopped', 'error'];
const statusLabels = {
  'draft': '草稿',
  'published': '已发布',
  'running': '运行中',
  'stopped': '已停止',
  'error': '异常'
};

// 工作流分类
const categories = [
  '数据处理',
  '机器学习',
  '数据分析',
  '数据清洗',
  '数据可视化',
  '模型训练',
  '预测分析',
  '实时计算',
  '批处理',
  '数据集成'
];

// 标签池
const tagPool = [
  '数据处理', '机器学习', '数据分析', '数据可视化', '自动化',
  '实时', '批处理', '清洗', '转换', '集成', '监控', '告警',
  '深度学习', '神经网络', '回归分析', '分类算法', '聚类',
  'ETL', 'BI', '报表', '仪表板', 'API', '微服务'
];

// 作者池
const authors = [
  '张三', '李四', '王五', '赵六', '钱七',
  '系统管理员', '数据工程师', '算法工程师', '产品经理', '开发工程师'
];

// 生成随机工作流数据
const generateWorkflow = (id: number) => {
  const now = new Date();
  const createTime = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
  const updateTime = new Date(createTime.getTime() + Math.random() * (now.getTime() - createTime.getTime()));

  const randomTags = tagPool
    .sort(() => 0.5 - Math.random())
    .slice(0, Math.floor(Math.random() * 4) + 1);

  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const author = authors[Math.floor(Math.random() * authors.length)];

  const workflowNames = [
    '用户行为分析流程',
    '销售数据处理管道',
    '实时推荐系统',
    '异常检测工作流',
    '数据质量监控',
    '客户画像构建',
    '财务报表生成',
    '库存预测模型',
    '风险评估系统',
    'A/B测试分析',
    '日志数据清洗',
    '营销效果评估',
    '供应链优化',
    '设备故障预警',
    '文本情感分析',
    '图像识别流程',
    '语音转写系统',
    '个性化推荐',
    '欺诈检测模型',
    '价格优化算法'
  ];

  return {
    id: id,
    name: workflowNames[id % workflowNames.length] || `工作流 ${id}`,
    categoryId: Math.floor(Math.random() * 10) + 1,
    category: category,
    description: `这是一个${category}相关的工作流，用于处理和分析相关业务数据。该工作流包含多个处理步骤，能够自动化完成数据的采集、处理、分析和输出。`,
    status: status,
    version: `1.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
    author: author,
    tags: randomTags,
    nodes: [],
    edges: [],
    createTime: createTime.toISOString().slice(0, 19).replace('T', ' '),
    updateTime: updateTime.toISOString().slice(0, 19).replace('T', ' ')
  };
};

// 生成工作流列表数据
const generateWorkflowList = (count: number) => {
  return Array.from({ length: count }, (_, i) => generateWorkflow(i + 1));
};

// Mock 数据存储
const workflowList = generateWorkflowList(120);

export default [
  // 获取工作流列表
  {
    url: "/workflow/list",
    method: "get",
    response: ({ query }) => {
      const {
        page = 1,
        pageSize = 20,
        keyword,
        categoryId,
        status,
        prop: sortField,
        order: sortOrder
      } = query;

      let filteredList = [...workflowList];

      // 关键字搜索
      if (keyword) {
        const searchKeyword = keyword.toLowerCase();
        filteredList = filteredList.filter(
          item =>
            item.name.toLowerCase().includes(searchKeyword) ||
            item.description.toLowerCase().includes(searchKeyword) ||
            item.author.toLowerCase().includes(searchKeyword) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchKeyword))
        );
      }

      // 分类过滤
      if (categoryId) {
        const categoryIds = Array.isArray(categoryId) ? categoryId : [categoryId];
        filteredList = filteredList.filter(item =>
          categoryIds.includes(item.categoryId.toString()) ||
          categoryIds.includes(item.categoryId)
        );
      }

      // 状态过滤
      if (status) {
        filteredList = filteredList.filter(item => item.status === status);
      }

      // 排序
      if (sortField && sortOrder) {
        filteredList.sort((a: any, b: any) => {
          let aValue = a[sortField];
          let bValue = b[sortField];

          // 处理时间字段
          if (sortField === 'createTime' || sortField === 'updateTime') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
          }

          const factor = sortOrder === 'ascending' ? 1 : -1;

          if (aValue < bValue) return -factor;
          if (aValue > bValue) return factor;
          return 0;
        });
      }

      // 分页
      const start = (Number(page) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      const pageList = filteredList.slice(start, end);

      return {
        code: 0,
        msg: "success",
        data: {
          list: pageList,
          total: filteredList.length
        }
      };
    }
  },

  // 获取工作流详情
  {
    url: "/workflow/:id",
    method: "get",
    response: ({ params, query, url }) => {
      // 从URL中提取ID
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 1];

      // 兼容性处理：从params或URL中获取ID
      const workflowId = params?.id || id;

      if (!workflowId) {
        return {
          code: 400,
          msg: "缺少工作流ID",
          data: null
        };
      }

      const workflow = workflowList.find(item => item.id == workflowId);
      return {
        code: workflow ? 0 : 404,
        msg: workflow ? "success" : "工作流不存在",
        data: workflow
      };
    }
  },

  // 创建工作流
  {
    url: "/workflow",
    method: "post",
    response: ({ body }) => {
      const id = Math.max(...workflowList.map(w => w.id)) + 1;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const workflow = {
        id: id,
        name: body.name || '新建工作流',
        categoryId: body.categoryId || 1,
        category: body.category || categories[0],
        description: body.description || '',
        status: 'draft',
        version: body.version || '1.0.0',
        author: body.author || '系统管理员',
        tags: body.tags || [],
        nodes: [],
        edges: [],
        createTime: now,
        updateTime: now
      };
      workflowList.unshift(workflow);
      return {
        code: 0,
        msg: "创建成功",
        data: workflow
      };
    }
  },

  // 更新工作流
  {
    url: "/workflow/:id",
    method: "put",
    response: ({ params, body, url }) => {
      // 从URL中提取ID
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 1];
      const workflowId = params?.id || id;

      if (!workflowId) {
        return {
          code: 400,
          msg: "缺少工作流ID",
          data: null
        };
      }

      const index = workflowList.findIndex(item => item.id == workflowId);
      if (index === -1) {
        return {
          code: 404,
          msg: "工作流不存在",
          data: null
        };
      }
      const workflow = {
        ...workflowList[index],
        ...body,
        updateTime: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      workflowList[index] = workflow;
      return {
        code: 0,
        msg: "更新成功",
        data: workflow
      };
    }
  },

  // 删除工作流
  {
    url: "/workflow/:id",
    method: "delete",
    response: ({ params, url }) => {
      // 从URL中提取ID
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 1];
      const workflowId = params?.id || id;

      if (!workflowId) {
        return {
          code: 400,
          msg: "缺少工作流ID"
        };
      }

      const index = workflowList.findIndex(item => item.id == workflowId);
      if (index === -1) {
        return {
          code: 404,
          msg: "工作流不存在"
        };
      }
      workflowList.splice(index, 1);
      return {
        code: 0,
        msg: "删除成功"
      };
    }
  },

  // 批量删除工作流
  {
    url: "/workflow/batch",
    method: "delete",
    response: ({ body }) => {
      const { ids } = body;
      let deletedCount = 0;
      ids.forEach((id: number) => {
        const index = workflowList.findIndex(item => item.id == id);
        if (index !== -1) {
          workflowList.splice(index, 1);
          deletedCount++;
        }
      });
      return {
        code: 0,
        msg: `成功删除 ${deletedCount} 个工作流`
      };
    }
  },

  // 批量导出工作流
  {
    url: "/workflow/export",
    method: "post",
    response: ({ body }) => {
      const { ids } = body;
      // 模拟导出功能
      const exportData = workflowList.filter(item => ids.includes(item.id));

      // 模拟文件下载
      setTimeout(() => {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workflow_export_${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);

      return {
        code: 0,
        msg: "导出成功"
      };
    }
  },

  // 发布工作流
  {
    url: "/workflow/:id/publish",
    method: "post",
    response: ({ params, url }) => {
      // 从URL中提取ID
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 2]; // publish前的是ID
      const workflowId = params?.id || id;

      if (!workflowId) {
        return {
          code: 400,
          msg: "缺少工作流ID"
        };
      }

      const workflow = workflowList.find(item => item.id == workflowId);
      if (!workflow) {
        return {
          code: 404,
          msg: "工作流不存在"
        };
      }
      workflow.status = "published";
      workflow.updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      return {
        code: 0,
        msg: "发布成功"
      };
    }
  },

  // 归档工作流
  {
    url: "/workflow/:id/archive",
    method: "post",
    response: ({ params, url }) => {
      // 从URL中提取ID
      const urlParts = url.split('/');
      const id = urlParts[urlParts.length - 2]; // archive前的是ID
      const workflowId = params?.id || id;

      if (!workflowId) {
        return {
          code: 400,
          msg: "缺少工作流ID"
        };
      }

      const workflow = workflowList.find(item => item.id == workflowId);
      if (!workflow) {
        return {
          code: 404,
          msg: "工作流不存在"
        };
      }
      workflow.status = "archived";
      workflow.updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      return {
        code: 0,
        msg: "归档成功"
      };
    }
  },

  // 启动工作流
  {
    url: "/workflow/:id/start",
    method: "post",
    response: ({ params }) => {
      const workflow = workflowList.find(item => item.id == params.id);
      if (!workflow) {
        return {
          code: 404,
          msg: "工作流不存在"
        };
      }
      if (workflow.status !== 'published') {
        return {
          code: 400,
          msg: "只有已发布的工作流才能启动"
        };
      }
      workflow.status = "running";
      workflow.updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      return {
        code: 0,
        msg: "启动成功"
      };
    }
  },

  // 停止工作流
  {
    url: "/workflow/:id/stop",
    method: "post",
    response: ({ params }) => {
      const workflow = workflowList.find(item => item.id == params.id);
      if (!workflow) {
        return {
          code: 404,
          msg: "工作流不存在"
        };
      }
      if (workflow.status !== 'running') {
        return {
          code: 400,
          msg: "只有运行中的工作流才能停止"
        };
      }
      workflow.status = "stopped";
      workflow.updateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      return {
        code: 0,
        msg: "停止成功"
      };
    }
  },

  // 复制工作流
  {
    url: "/workflow/:id/copy",
    method: "post",
    response: ({ params, body }) => {
      const originalWorkflow = workflowList.find(item => item.id == params.id);
      if (!originalWorkflow) {
        return {
          code: 404,
          msg: "源工作流不存在"
        };
      }

      const id = Math.max(...workflowList.map(w => w.id)) + 1;
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const copiedWorkflow = {
        ...originalWorkflow,
        id: id,
        name: body.name || `${originalWorkflow.name} - 副本`,
        status: 'draft',
        createTime: now,
        updateTime: now
      };

      workflowList.unshift(copiedWorkflow);
      return {
        code: 0,
        msg: "复制成功",
        data: copiedWorkflow
      };
    }
  }
] as MockMethod[]; 