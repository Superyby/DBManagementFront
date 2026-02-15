// API 配置
export const API_CONFIG = {
  // 基础 URL - 开发环境使用代理
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // 超时时间
  timeout: 30000,
  
  // 后端服务端口
  gatewayPort: 8080,
  connectionServicePort: 8081,
  queryServicePort: 8082,
  aiServicePort: 8083,
};

// API 端点
export const API_ENDPOINTS = {
  // 健康检查
  health: '/health',
  healthAggregated: '/health/aggregated',
  
  // 连接管理
  connections: '/connections',
  connectionById: (id: string) => `/connections/${id}`,
  connectionTest: (id: string) => `/connections/${id}/test`,
  
  // 监控
  connectionStats: (id: string) => `/connections/${id}/stats`,
  connectionDatabases: (id: string) => `/connections/${id}/databases`,
  connectionProcesses: (id: string) => `/connections/${id}/processes`,
  
  // 查询服务
  query: '/query',
  
  // AI 服务
  aiQuery: '/ai/query',
  aiClarify: '/ai/clarify',
  aiValidate: '/ai/validate',
};
