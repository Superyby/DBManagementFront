// src/services/api.ts
import axios from 'axios';

// 创建 axios 实例（自动处理 /api 代理）
export const api = axios.create({
  baseURL: '/api', 
  timeout: 10000,
});

// 健康检查接口
export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

export const healthCheck = () => api.get<HealthResponse>('/health');

// 数据库列表接口
export interface DatabaseItem {
  id: number;
  name: string;
  type: string;
  host: string;
  port: number;
}

export const listDatabases = (params?: { dbType?: string }) =>
  api.post<DatabaseItem[]>('/databases', { db_type: params?.dbType });