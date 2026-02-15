import { get, post, del } from '../request';
import { API_ENDPOINTS } from '../config';
import type {
  ConnectionItem,
  CreateConnectionRequest,
  ConnectionTestResult,
  AggregatedHealth,
  HealthResponse,
} from '../../types/connection';

// 获取所有连接列表
export async function getConnections() {
  return get<ConnectionItem[]>(API_ENDPOINTS.connections);
}

// 获取单个连接详情
export async function getConnection(id: string) {
  return get<ConnectionItem>(API_ENDPOINTS.connectionById(id));
}

// 创建新连接
export async function createConnection(data: CreateConnectionRequest) {
  return post<ConnectionItem>(API_ENDPOINTS.connections, data);
}

// 删除连接
export async function deleteConnection(id: string) {
  return del<boolean>(API_ENDPOINTS.connectionById(id));
}

// 测试连接
export async function testConnection(id: string) {
  return get<ConnectionTestResult>(API_ENDPOINTS.connectionTest(id));
}

// 获取聚合健康状态
export async function getAggregatedHealth() {
  return get<AggregatedHealth>(API_ENDPOINTS.healthAggregated);
}

// 获取健康检查
export async function getHealth() {
  return get<HealthResponse>(API_ENDPOINTS.health);
}
