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

const generateOperatorsData = () => Array.from({ length: 50 }).map((_, i) => {
  const type = typeArr[i % typeArr.length];
  let categoryId;
  if (type === OperatorType.BASIC) {
    categoryId = basicLeafIds[i % basicLeafIds.length];
  } else if (type === OperatorType.SCRIPT) {
    categoryId = scriptLeafIds[i % scriptLeafIds.length];
  } else {
    categoryId = externalLeafIds[i % externalLeafIds.length];
  }
  return {
    id: i + 1,
    name: names[i % names.length] + '算子',
    type,
    categoryId,
    description: `这是${names[i % names.length]}的${type === OperatorType.BASIC ? '基础' : type === OperatorType.SCRIPT ? '脚本' : '外部'}算子。`,
    version: `1.${i % 5}.${i % 10}`,
    author: authors[i % authors.length],
    createTime: `2024-01-${(i % 28 + 1).toString().padStart(2, '0')} 0${i % 10}:00:00`,
    updateTime: `2024-02-${(i % 28 + 1).toString().padStart(2, '0')} 1${i % 10}:00:00`,
    status: i % 7 === 0 ? 'inactive' : 'active',
    tags: tagsList[i % tagsList.length]
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

        if (query.categoryId) {
          // 支持categoryId为单个id或数组，数组时查所有子分类
          let catIds: number[] = [];
          if (Array.isArray(query.categoryId)) {
            catIds = query.categoryId.flatMap(id => String(id).split(',').map(Number));
          } else {
            catIds = String(query.categoryId).split(',').map(Number);
          }
          filtered = filtered.filter(item => catIds.includes(item.categoryId));
          console.log('Filtered by categoryId:', catIds, 'Available operators:', filtered.map(op => ({ id: op.id, name: op.name, categoryId: op.categoryId })));
        }

        if (query.type) {
          const type = Array.isArray(query.type) ? query.type[0] : query.type;
          filtered = filtered.filter(item => item.type === type);
          console.log('Filtered by type:', type, 'result count:', filtered.length);
        }

        if (query.keyword) {
          const keyword = Array.isArray(query.keyword) ? query.keyword[0] : query.keyword;
          filtered = filtered.filter(item =>
            item.name.includes(keyword) || item.description.includes(keyword)
          );
          console.log('Filtered by keyword:', keyword, 'result count:', filtered.length);
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