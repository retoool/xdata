<script setup lang="ts">
import { ref, onMounted, h, nextTick } from "vue";
import { useRouter } from "vue-router";
import * as echarts from "echarts";
import {
  Setting,
  TrendCharts,
  CircleCheck,
  Operation,
  Share,
  DataAnalysis,
  ArrowRight,
  Plus,
  View,
  Histogram,
  Clock,
  List,
  Edit,
  Monitor,
  Document
} from "@element-plus/icons-vue";

defineOptions({
  name: "Welcome"
});

const router = useRouter();

// 统计数据
const stats = ref({
  algorithms: 0,
  workflows: 0,
  executions: 0,
  successRate: 0
});

// 最近工作流数据
const recentWorkflows = ref([
  { id: 1, name: "数据清洗工作流", createTime: "2024-01-20 14:30" },
  { id: 2, name: "机器学习训练流程", createTime: "2024-01-20 10:15" },
  { id: 3, name: "数据分析管道", createTime: "2024-01-19 16:45" },
  { id: 4, name: "报表生成流程", createTime: "2024-01-19 09:20" }
]);

// 图表引用
const executionTrendChart = ref();
const operatorDistributionChart = ref();

// 导航到指定页面
const navigateTo = (path: string) => {
  router.push(path);
};

// 模拟加载统计数据
const loadStats = () => {
  // 模拟异步加载数据，添加动画效果
  setTimeout(() => {
    animateNumber("algorithms", 156);
    animateNumber("workflows", 42);
    animateNumber("executions", 1248);
    animateNumber("successRate", 98.5);
  }, 600);
};

// 数字动画效果
const animateNumber = (key: string, target: number) => {
  const duration = 1000;
  const steps = 60;
  const stepValue = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += stepValue;
    if (current >= target) {
      stats.value[key] = target;
      clearInterval(timer);
    } else {
      stats.value[key] = Math.floor(current);
    }
  }, duration / steps);
};

// 添加 Workflow 图标组件
const Workflow = {
  name: "Workflow",
  render() {
    return h(
      "svg",
      {
        viewBox: "0 0 1024 1024",
        width: "1em",
        height: "1em",
        fill: "currentColor"
      },
      [
        h("path", {
          d: "M300 120a60 60 0 1 1-120 0 60 60 0 0 1 120 0zm264 0a60 60 0 1 1-120 0 60 60 0 0 1 120 0zm264 0a60 60 0 1 1-120 0 60 60 0 0 1 120 0zM300 384a60 60 0 1 1-120 0 60 60 0 0 1 120 0zm264 0a60 60 0 1 1-120 0 60 60 0 0 1 120 0zm264 0a60 60 0 1 1-120 0 60 60 0 0 1 120 0zM300 648a60 60 0 1 1-120 0 60 60 0 0 1 120 0zm264 0a60 60 0 1 1-120 0 60 60 0 0 1 120 0zm264 0a60 60 0 1 1-120 0 60 60 0 0 1 120 0zM300 912a60 60 0 1 1-120 0 60 60 0 0 1 120 0zm264 0a60 60 0 1 1-120 0 60 60 0 0 1 120 0zm264 0a60 60 0 1 1-120 0 60 60 0 0 1 120 0z"
        })
      ]
    );
  }
};

// 初始化执行趋势图表
const initExecutionTrendChart = () => {
  if (!executionTrendChart.value) return;

  const chart = echarts.init(executionTrendChart.value);
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      }
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "8%",
      containLabel: true
    },
    xAxis: {
      type: "category",
      data: ["01-14", "01-15", "01-16", "01-17", "01-18", "01-19", "01-20"],
      axisLine: {
        lineStyle: {
          color: "var(--el-border-color)"
        }
      }
    },
    yAxis: {
      type: "value",
      axisLine: {
        lineStyle: {
          color: "var(--el-border-color)"
        }
      }
    },
    series: [
      {
        name: "执行次数",
        type: "line",
        data: [45, 52, 61, 58, 67, 72, 85],
        smooth: true,
        lineStyle: {
          width: 3,
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: "#409EFF" },
              { offset: 1, color: "#6366f1" }
            ]
          }
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(64, 158, 255, 0.3)" },
              { offset: 1, color: "rgba(64, 158, 255, 0.05)" }
            ]
          }
        }
      }
    ]
  };
  chart.setOption(option);

  // 监听主题变化
  window.addEventListener("resize", () => chart.resize());
};

// 初始化算子分布图表
const initOperatorDistributionChart = () => {
  if (!operatorDistributionChart.value) return;

  const chart = echarts.init(operatorDistributionChart.value);
  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c} ({d}%)"
    },
    legend: {
      orient: "vertical",
      left: "left",
      textStyle: {
        color: "var(--el-text-color-primary)"
      }
    },
    series: [
      {
        name: "算子分类",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "50%"],
        data: [
          { value: 35, name: "数据处理", itemStyle: { color: "#409EFF" } },
          { value: 28, name: "机器学习", itemStyle: { color: "#67C23A" } },
          { value: 22, name: "数据分析", itemStyle: { color: "#E6A23C" } },
          { value: 18, name: "可视化", itemStyle: { color: "#F56C6C" } },
          { value: 12, name: "其他", itemStyle: { color: "#909399" } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        }
      }
    ]
  };
  chart.setOption(option);

  // 监听主题变化
  window.addEventListener("resize", () => chart.resize());
};

onMounted(() => {
  loadStats();
  nextTick(() => {
    setTimeout(() => {
      initExecutionTrendChart();
      initOperatorDistributionChart();
    }, 800);
  });
});
</script>

<template>
  <div class="welcome-page">
    <!-- 顶部标题区域 -->
    <div
      v-motion
      class="hero-section"
      :initial="{ opacity: 0, y: -30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
    >
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-gradient">XDATA</span>
        </h1>
        <p class="hero-subtitle">现代化数据管理系统</p>
        <p class="hero-description">
          提供完整的数据处理工作流功能，包含算子管理、工作流设计器等核心功能模块，适合企业级数据处理场景
        </p>
      </div>
    </div>

    <!-- 数据概览卡片 -->
    <div
      v-motion
      class="stats-section"
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
    >
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon algorithms">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.algorithms }}</div>
            <div class="stat-label">算子总数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon workflows">
            <el-icon><Workflow /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.workflows }}</div>
            <div class="stat-label">工作流</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon executions">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.executions }}</div>
            <div class="stat-label">执行次数</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success-rate">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ stats.successRate }}%</div>
            <div class="stat-label">成功率</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能特性展示 -->
    <div
      v-motion
      class="features-section"
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
    >
      <h2 class="section-title">核心功能</h2>
      <div class="features-grid">
        <div class="feature-card" @click="navigateTo('/computer/operator')">
          <div class="feature-icon">
            <el-icon><Operation /></el-icon>
          </div>
          <h3 class="feature-title">算子管理</h3>
          <p class="feature-description">
            提供完整的算子分类和管理功能，支持算子的创建、编辑、分类和版本控制
          </p>
          <div class="feature-action">
            <el-button type="primary" link>
              进入管理 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="feature-card" @click="navigateTo('/computer/workflow')">
          <div class="feature-icon">
            <el-icon><Share /></el-icon>
          </div>
          <h3 class="feature-title">工作流设计器</h3>
          <p class="feature-description">
            可视化的工作流设计和执行环境，拖拽式操作，轻松构建复杂的数据处理流程
          </p>
          <div class="feature-action">
            <el-button type="primary" link>
              开始设计 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="feature-card">
          <div class="feature-icon">
            <el-icon><DataAnalysis /></el-icon>
          </div>
          <h3 class="feature-title">数据处理</h3>
          <p class="feature-description">
            强大的数据处理和分析能力，支持多种数据源接入和实时数据处理
          </p>
          <div class="feature-action">
            <el-button type="primary" link>
              了解更多 <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能导航网格 -->
    <div
      v-motion
      class="navigation-section"
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 350 } }"
    >
      <h2 class="section-title">功能导航</h2>
      <div class="navigation-grid">
        <div class="nav-item" @click="navigateTo('/computer/operator')">
          <div class="nav-icon">
            <el-icon><Operation /></el-icon>
          </div>
          <div class="nav-content">
            <h4 class="nav-title">算子管理</h4>
            <p class="nav-desc">管理和配置数据处理算子</p>
          </div>
        </div>

        <div class="nav-item" @click="navigateTo('/computer/workflow')">
          <div class="nav-icon">
            <el-icon><Share /></el-icon>
          </div>
          <div class="nav-content">
            <h4 class="nav-title">工作流管理</h4>
            <p class="nav-desc">查看和管理数据处理工作流</p>
          </div>
        </div>

        <div
          class="nav-item"
          @click="navigateTo('/computer/workflow/designer')"
        >
          <div class="nav-icon">
            <el-icon><Edit /></el-icon>
          </div>
          <div class="nav-content">
            <h4 class="nav-title">工作流设计器</h4>
            <p class="nav-desc">可视化设计数据处理流程</p>
          </div>
        </div>

        <div class="nav-item">
          <div class="nav-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <div class="nav-content">
            <h4 class="nav-title">系统监控</h4>
            <p class="nav-desc">监控系统运行状态和性能</p>
          </div>
        </div>

        <div class="nav-item">
          <div class="nav-icon">
            <el-icon><Document /></el-icon>
          </div>
          <div class="nav-content">
            <h4 class="nav-title">文档中心</h4>
            <p class="nav-desc">查看系统使用文档和API</p>
          </div>
        </div>

        <div class="nav-item">
          <div class="nav-icon">
            <el-icon><Setting /></el-icon>
          </div>
          <div class="nav-content">
            <h4 class="nav-title">系统设置</h4>
            <p class="nav-desc">配置系统参数和用户权限</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 数据可视化图表 -->
    <div
      v-motion
      class="charts-section"
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
    >
      <h2 class="section-title">数据分析</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">工作流执行趋势</h3>
            <p class="chart-subtitle">最近7天执行统计</p>
          </div>
          <div ref="executionTrendChart" class="chart-container" />
        </div>

        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">算子分类分布</h3>
            <p class="chart-subtitle">按类型统计算子数量</p>
          </div>
          <div ref="operatorDistributionChart" class="chart-container" />
        </div>
      </div>
    </div>

    <!-- 最近活动面板 -->
    <div
      v-motion
      class="recent-activity-section"
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 450 } }"
    >
      <h2 class="section-title">最近活动</h2>
      <div class="activity-grid">
        <div class="activity-card">
          <div class="activity-header">
            <h3 class="activity-title">
              <el-icon><Clock /></el-icon>
              最近创建的工作流
            </h3>
          </div>
          <div class="activity-list">
            <div
              v-for="workflow in recentWorkflows"
              :key="workflow.id"
              class="activity-item"
              @click="
                navigateTo(`/computer/workflow/designer?id=${workflow.id}`)
              "
            >
              <div class="activity-icon">
                <el-icon><Share /></el-icon>
              </div>
              <div class="activity-content">
                <div class="activity-name">{{ workflow.name }}</div>
                <div class="activity-time">{{ workflow.createTime }}</div>
              </div>
              <div class="activity-action">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <div class="activity-card">
          <div class="activity-header">
            <h3 class="activity-title">
              <el-icon><List /></el-icon>
              系统运行状态
            </h3>
          </div>
          <div class="status-list">
            <div class="status-item">
              <div class="status-indicator running" />
              <span class="status-text">数据处理服务</span>
              <span class="status-value">运行中</span>
            </div>
            <div class="status-item">
              <div class="status-indicator running" />
              <span class="status-text">工作流引擎</span>
              <span class="status-value">运行中</span>
            </div>
            <div class="status-item">
              <div class="status-indicator running" />
              <span class="status-text">算子管理器</span>
              <span class="status-value">运行中</span>
            </div>
            <div class="status-item">
              <div class="status-indicator warning" />
              <span class="status-text">缓存服务</span>
              <span class="status-value">繁忙</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作区域 -->
    <div
      v-motion
      class="quick-actions-section"
      :initial="{ opacity: 0, y: 30 }"
      :enter="{ opacity: 1, y: 0, transition: { delay: 500 } }"
    >
      <h2 class="section-title">快速开始</h2>
      <div class="actions-grid">
        <el-button
          type="primary"
          size="large"
          class="action-button"
          @click="navigateTo('/computer/workflow/designer')"
        >
          <el-icon><Plus /></el-icon>
          创建新工作流
        </el-button>

        <el-button
          type="default"
          size="large"
          class="action-button"
          @click="navigateTo('/computer/operator')"
        >
          <el-icon><View /></el-icon>
          浏览算子库
        </el-button>

        <el-button
          type="default"
          size="large"
          class="action-button"
          @click="navigateTo('/computer/workflow')"
        >
          <el-icon><Histogram /></el-icon>
          查看工作流
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.welcome-page {
  padding: 0 24px 24px;
  min-height: calc(100vh - 120px);
  background: linear-gradient(
    135deg,
    var(--el-bg-color) 0%,
    var(--el-bg-color-page) 100%
  );
}

/* 顶部标题区域 */
.hero-section {
  text-align: center;
  padding: 60px 0;
  background: linear-gradient(
    135deg,
    rgba(64, 158, 255, 0.05) 0%,
    rgba(103, 102, 244, 0.05) 100%
  );
  border-radius: 20px;
  margin-bottom: 40px;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  margin: 0 0 16px;
  line-height: 1.2;
}

.title-gradient {
  background: linear-gradient(135deg, #409eff 0%, #6366f1 50%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--el-text-color-primary);
  margin: 0 0 24px;
  font-weight: 500;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
}

/* 数据概览卡片 */
.stats-section {
  margin-bottom: 60px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  background: var(--el-bg-color);
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-icon.algorithms {
  background: linear-gradient(135deg, #409eff 0%, #6366f1 100%);
}

.stat-icon.workflows {
  background: linear-gradient(135deg, #67c23a 0%, #22c55e 100%);
}

.stat-icon.executions {
  background: linear-gradient(135deg, #e6a23c 0%, #f59e0b 100%);
}

.stat-icon.success-rate {
  background: linear-gradient(135deg, #f56c6c 0%, #ec4899 100%);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

/* 功能特性展示 */
.features-section,
.quick-actions-section {
  margin-bottom: 60px;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 48px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: var(--el-bg-color);
  border-radius: 20px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
  cursor: pointer;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: var(--el-color-primary);
}

.feature-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary) 0%,
    var(--el-color-primary-light-3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 32px;
  color: white;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px;
}

.feature-description {
  font-size: 1rem;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0 0 24px;
}

.feature-action {
  display: flex;
  justify-content: center;
}

/* 快速操作区域 */
.actions-grid {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
  max-width: 800px;
  margin: 0 auto;
}

.action-button {
  padding: 16px 32px;
  font-size: 1.1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .welcome-page {
    padding: 0 16px 16px;
  }

  .hero-section {
    padding: 40px 20px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.2rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 20px 16px;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .feature-card {
    padding: 32px 24px;
  }

  .actions-grid {
    flex-direction: column;
    align-items: center;
  }

  .action-button {
    width: 100%;
    max-width: 300px;
  }
}

/* 功能导航网格 */
.navigation-section {
  margin-bottom: 60px;
}

.navigation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.nav-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}

.nav-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary) 0%,
    var(--el-color-primary-light-3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.nav-content {
  flex: 1;
}

.nav-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 6px;
}

.nav-desc {
  font-size: 0.85rem;
  color: var(--el-text-color-regular);
  margin: 0;
  line-height: 1.4;
}

/* 数据可视化图表 */
.charts-section {
  margin-bottom: 60px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(480px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.chart-card {
  background: var(--el-bg-color);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.chart-header {
  margin-bottom: 24px;
}

.chart-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}

.chart-subtitle {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  margin: 0;
}

.chart-container {
  width: 100%;
  height: 300px;
}

/* 最近活动面板 */
.recent-activity-section {
  margin-bottom: 60px;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.activity-card {
  background: var(--el-bg-color);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.activity-header {
  margin-bottom: 24px;
}

.activity-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
  transform: translateX(4px);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary) 0%,
    var(--el-color-primary-light-3) 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.activity-content {
  flex: 1;
}

.activity-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.activity-time {
  font-size: 0.85rem;
  color: var(--el-text-color-regular);
}

.activity-action {
  color: var(--el-text-color-placeholder);
  transition: all 0.3s ease;
}

.activity-item:hover .activity-action {
  color: var(--el-color-primary);
  transform: translateX(4px);
}

/* 系统状态列表 */
.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
}

.status-indicator.running {
  background: #67c23a;
  box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.2);
}

.status-indicator.warning {
  background: #e6a23c;
  box-shadow: 0 0 0 4px rgba(230, 162, 60, 0.2);
}

.status-indicator.running::before,
.status-indicator.warning::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: inherit;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

.status-text {
  flex: 1;
  font-size: 0.95rem;
  color: var(--el-text-color-primary);
}

.status-value {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

/* 响应式设计扩展 */
@media (max-width: 768px) {
  .navigation-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .nav-item {
    padding: 16px;
  }

  .nav-icon {
    width: 42px;
    height: 42px;
    font-size: 18px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .chart-card {
    padding: 24px 20px;
  }

  .chart-container {
    height: 250px;
  }

  .activity-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .activity-card {
    padding: 24px 20px;
  }

  .activity-item {
    padding: 12px;
  }

  .activity-icon {
    width: 36px;
    height: 36px;
    font-size: 16px;
  }
}

/* 暗色主题适配 */
.dark .hero-section {
  background: linear-gradient(
    135deg,
    rgba(64, 158, 255, 0.1) 0%,
    rgba(103, 102, 244, 0.1) 100%
  );
}

.dark .stat-card,
.dark .feature-card,
.dark .chart-card,
.dark .activity-card,
.dark .nav-item {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
}

.dark .stat-card:hover,
.dark .feature-card:hover,
.dark .chart-card:hover,
.dark .activity-card:hover,
.dark .nav-item:hover {
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.05);
}

.dark .activity-item,
.dark .status-item {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}

.dark .activity-item:hover {
  background: rgba(64, 158, 255, 0.1);
  border-color: var(--el-color-primary);
}
</style>
