import { defineFakeRoute } from 'vite-plugin-fake-server/client';

// 算子类型枚举
enum OperatorType {
  BASIC = 'basic',      // 基础算子
  SCRIPT = 'script',    // 脚本算子
  EXTERNAL = 'external' // 外部算子
}

// 批量生成模拟数据
const names = [
  '数据清洗', '特征提取', '归一化', '标准化', '异常检测', '缺失值填充', '主成分分析', '聚类分析',
  '分类预测', '回归分析', '降维处理', '数据增强', '数据分箱', '离群点检测', '数据合并', '数据拆分',
  'SQL查询', 'API调用', 'Python脚本', 'R脚本', 'TensorFlow训练', 'Scikit-learn模型',
  '数据可视化', '统计分析', '数据导出', '数据导入', '批量处理', '实时计算', '分布式处理', '流式处理',
  '外部API集成', '数据库连接', 'MySQL操作', 'PostgreSQL操作', 'MongoDB操作', 'Redis缓存',
  '用户服务', '订单服务', '支付服务', '天气API', '地图API', '日志分析', '监控告警', '权限校验', '数据脱敏'
];
const authors = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
const tagsList = [
  ['数据', '清洗'], ['特征', '机器学习'], ['归一化'], ['标准化'], ['异常'], ['缺失'], ['PCA'], ['聚类'],
  ['分类'], ['回归'], ['降维'], ['增强'], ['分箱'], ['离群点'], ['合并'], ['拆分'],
  ['SQL'], ['API'], ['Python'], ['R'], ['TensorFlow'], ['Sklearn'],
  ['可视化'], ['统计'], ['导出'], ['导入'], ['批量'], ['实时'], ['分布式'], ['流式'],
  ['外部API'], ['数据库'], ['MySQL'], ['PostgreSQL'], ['MongoDB'], ['Redis'],
  ['用户'], ['订单'], ['支付'], ['天气'], ['地图'], ['日志'], ['监控'], ['权限'], ['脱敏']
];
const typeArr = [OperatorType.BASIC, OperatorType.SCRIPT, OperatorType.EXTERNAL];

const basicLeafIds = [9, 10, 11, 12, 13, 6, 7, 8];
const scriptLeafIds = [109, 110, 111, 112, 106, 107, 108, 113];
const externalLeafIds = [209, 210, 211, 212, 213, 206, 207, 208];

// 分类树数据（与operatorCategoryTree.ts保持一致）
const categoryTreeData = {
  basic: [
    {
      id: 1,
      label: '数据预处理',
      children: [
        {
          id: 4,
          label: '数据清洗',
          children: [
            { id: 9, label: '缺失值处理' },
            { id: 10, label: '异常值检测' },
            { id: 11, label: '数据标准化' }
          ]
        },
        {
          id: 5,
          label: '特征工程',
          children: [
            { id: 12, label: '特征选择' },
            { id: 13, label: '特征变换' }
          ]
        }
      ]
    },
    {
      id: 2,
      label: '机器学习',
      children: [
        { id: 6, label: '分类算法' },
        { id: 7, label: '回归算法' },
        { id: 8, label: '聚类算法' }
      ]
    }
  ],
  script: [
    {
      id: 101,
      label: 'Python脚本',
      children: [
        {
          id: 104,
          label: '数据处理脚本',
          children: [
            { id: 109, label: 'Pandas处理' },
            { id: 110, label: 'NumPy计算' }
          ]
        },
        {
          id: 105,
          label: '机器学习脚本',
          children: [
            { id: 111, label: 'Scikit-learn' },
            { id: 112, label: 'TensorFlow' }
          ]
        }
      ]
    },
    {
      id: 102,
      label: 'R脚本',
      children: [
        { id: 106, label: '统计分析' },
        { id: 107, label: '数据可视化' }
      ]
    },
    {
      id: 103,
      label: 'SQL脚本',
      children: [
        { id: 108, label: '数据查询' },
        { id: 113, label: '数据转换' }
      ]
    }
  ],
  external: [
    {
      id: 201,
      label: 'API服务',
      children: [
        {
          id: 204,
          label: '第三方API',
          children: [
            { id: 209, label: '天气API' },
            { id: 210, label: '地图API' },
            { id: 211, label: '支付API' }
          ]
        },
        {
          id: 205,
          label: '内部API',
          children: [
            { id: 212, label: '用户服务' },
            { id: 213, label: '订单服务' }
          ]
        }
      ]
    },
    {
      id: 202,
      label: '数据库连接',
      children: [
        { id: 206, label: 'MySQL' },
        { id: 207, label: 'PostgreSQL' },
        { id: 208, label: 'MongoDB' }
      ]
    }
  ]
};

// 获取分类的完整路径
function getCategoryPath(tree: any[], targetId: number): string[] {
  function findPath(nodes: any[], path: string[]): string[] | null {
    for (const node of nodes) {
      const currentPath = [...path, node.label];
      if (node.id === targetId) {
        return currentPath;
      }
      if (node.children) {
        const found = findPath(node.children, currentPath);
        if (found) return found;
      }
    }
    return null;
  }
  
  const path = findPath(tree, []);
  return path || ['未分类'];
}

const generateOperatorsData = () => Array.from({ length: 50 }).map((_, i) => {
  const type = typeArr[i % typeArr.length];
  let categoryId;
  let categoryPath;
  
  if (type === OperatorType.BASIC) {
    categoryId = basicLeafIds[i % basicLeafIds.length];
    categoryPath = getCategoryPath(categoryTreeData.basic, categoryId);
  } else if (type === OperatorType.SCRIPT) {
    categoryId = scriptLeafIds[i % scriptLeafIds.length];
    categoryPath = getCategoryPath(categoryTreeData.script, categoryId);
  } else {
    categoryId = externalLeafIds[i % externalLeafIds.length];
    categoryPath = getCategoryPath(categoryTreeData.external, categoryId);
  }
  
  // 为部分算子分配关联任务（一个算子只能被一个任务引用）
  const relatedTaskId = i % 3 === 0 ? (i / 3 + 1) : undefined;
  const relatedTaskName = relatedTaskId ? `任务${relatedTaskId}` : undefined;

  // 添加测试参数配置
  const params = [];
  
  // 基础算子的参数
  if (type === OperatorType.BASIC) {
    if (categoryPath[1] === '数据预处理') {
      params.push(
        {
          name: 'threshold',
          label: '阈值',
          type: 'number',
          value: 0.5,
          min: 0,
          max: 1,
          step: 0.1,
          required: true
        },
        {
          name: 'method',
          label: '处理方法',
          type: 'enum',
          value: 'mean',
          options: [
            { label: '均值', value: 'mean' },
            { label: '中位数', value: 'median' },
            { label: '众数', value: 'mode' }
          ],
          required: true
        }
      );
    } else if (categoryPath[1] === '机器学习') {
      params.push(
        {
          name: 'modelName',
          label: '模型名称',
          type: 'string',
          value: '',
          placeholder: '请输入模型名称',
          required: true
        },
        {
          name: 'epochs',
          label: '训练轮数',
          type: 'number',
          value: 100,
          min: 1,
          max: 1000,
          step: 1,
          required: true
        }
      );
    }
  }
  
  // 脚本算子的参数
  else if (type === OperatorType.SCRIPT) {
    params.push(
      {
        name: 'script',
        label: '脚本内容',
        type: 'string',
        value: '',
        placeholder: '请输入脚本内容',
        required: true
      },
      {
        name: 'timeout',
        label: '超时时间(秒)',
        type: 'number',
        value: 60,
        min: 1,
        max: 3600,
        step: 1,
        required: true
      }
    );
  }
  
  // 外部算子的参数
  else {
    params.push(
      {
        name: 'url',
        label: '接口地址',
        type: 'string',
        value: '',
        placeholder: '请输入接口地址',
        required: true
      },
      {
        name: 'method',
        label: '请求方法',
        type: 'enum',
        value: 'GET',
        options: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'DELETE', value: 'DELETE' }
        ],
        required: true
      }
    );
  }
  
  return {
    id: i + 1,
    name: names[i % names.length] + '算子',
    type,
    categoryId,
    categoryPath,
    description: `这是${names[i % names.length]}的${type === OperatorType.BASIC ? '基础' : type === OperatorType.SCRIPT ? '脚本' : '外部'}算子。`,
    version: `1.${i % 5}.${i % 10}`,
    author: authors[i % authors.length],
    createTime: `2024-01-${(i % 28 + 1).toString().padStart(2, '0')} 0${i % 10}:00:00`,
    updateTime: `2024-02-${(i % 28 + 1).toString().padStart(2, '0')} 1${i % 10}:00:00`,
    relatedTaskId,
    relatedTaskName,
    tags: tagsList[i % tagsList.length],
    params // 添加参数配置
  };
});

export let operatorsData = generateOperatorsData();

// 提供一个函数来更新算子数据（用于删除分类时同步删除算子）
export function updateOperatorsData(newData: any[]) {
  operatorsData.length = 0;
  operatorsData.push(...newData);
}

export default defineFakeRoute([
  {
    url: '/api/operators',
    method: 'get',
    response: ({ query }) => {
      try {
        let filtered = [...operatorsData]; // 创建副本避免修改原数据

        // 处理categoryId参数 - 支持数组格式的categoryId
        const categoryIds: number[] = [];
        Object.keys(query).forEach(key => {
          if (key.startsWith('categoryId[')) {
            const value = query[key];
            if (Array.isArray(value)) {
              categoryIds.push(...value.map(v => parseInt(String(v))));
            } else {
              categoryIds.push(parseInt(String(value)));
            }
          }
        });

        if (categoryIds.length > 0) {
          filtered = filtered.filter(item => categoryIds.includes(item.categoryId));
        }

        if (query.type) {
          const type = Array.isArray(query.type) ? query.type[0] : query.type;
          filtered = filtered.filter(item => item.type === type);
        }

        if (query.keyword) {
          const keyword = Array.isArray(query.keyword) ? query.keyword[0] : query.keyword;
          filtered = filtered.filter(item =>
            item.name.includes(keyword) || item.description.includes(keyword)
          );
        }

        const page = parseInt(Array.isArray(query.page) ? query.page[0] : query.page) || 1;
        const pageSize = parseInt(Array.isArray(query.pageSize) ? query.pageSize[0] : query.pageSize) || 20;
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const result = {
          code: 0,
          data: {
            list: filtered.slice(start, end),
            total: filtered.length
          },
          msg: '获取成功'
        };
        return result;
      } catch (error) {
        return {
          code: 1,
          msg: 'Mock error: ' + (error instanceof Error ? error.message : String(error)),
          data: { list: [], total: 0 }
        };
      }
    }
  }
]); 