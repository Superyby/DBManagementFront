// 数据库类型枚举
export type DbType =
  | 'mysql'
  | 'postgres'
  | 'sqlite'
  | 'redis'
  | 'mongodb'
  | 'clickhouse'
  | 'elasticsearch'
  | 'oracle'
  | 'sqlserver'
  | 'mariadb'
  | 'cassandra'
  | 'influxdb'
  | 'db2'
  | 'couchdb'
  | 'neo4j'
  | 'memcached'
  | 'hbase'
  | 'milvus';

// 数据库类型信息
export interface DbTypeInfo {
  name: string;
  defaultPort?: number;
  color: string;
  icon: string;
}

// 数据库类型映射
export const DB_TYPES: Record<DbType, DbTypeInfo> = {
  mysql: { name: 'MySQL', defaultPort: 3306, color: '#00758f', icon: 'database' },
  postgres: { name: 'PostgreSQL', defaultPort: 5432, color: '#336791', icon: 'database' },
  sqlite: { name: 'SQLite', color: '#003b57', icon: 'database' },
  redis: { name: 'Redis', defaultPort: 6379, color: '#dc382d', icon: 'server' },
  mongodb: { name: 'MongoDB', defaultPort: 27017, color: '#47a248', icon: 'database' },
  clickhouse: { name: 'ClickHouse', defaultPort: 8123, color: '#ffcc01', icon: 'database' },
  elasticsearch: { name: 'Elasticsearch', defaultPort: 9200, color: '#005571', icon: 'search' },
  oracle: { name: 'Oracle', defaultPort: 1521, color: '#f80000', icon: 'database' },
  sqlserver: { name: 'SQL Server', defaultPort: 1433, color: '#cc2927', icon: 'database' },
  mariadb: { name: 'MariaDB', defaultPort: 3306, color: '#003545', icon: 'database' },
  cassandra: { name: 'Cassandra', defaultPort: 9042, color: '#1287b1', icon: 'database' },
  influxdb: { name: 'InfluxDB', defaultPort: 8086, color: '#22adf6', icon: 'chart-line' },
  db2: { name: 'DB2', defaultPort: 50000, color: '#054ada', icon: 'database' },
  couchdb: { name: 'CouchDB', defaultPort: 5984, color: '#e42528', icon: 'database' },
  neo4j: { name: 'Neo4j', defaultPort: 7474, color: '#008cc1', icon: 'project-diagram' },
  memcached: { name: 'Memcached', defaultPort: 11211, color: '#748c16', icon: 'memory' },
  hbase: { name: 'HBase', defaultPort: 2181, color: '#df0000', icon: 'database' },
  milvus: { name: 'Milvus', defaultPort: 19530, color: '#00a1ea', icon: 'cube' },
};

// 连接项（API 响应）
export interface ConnectionItem {
  id: string;
  name: string;
  db_type: DbType;
  host?: string;
  port?: number;
  username?: string;
  database?: string;
  file_path?: string;
  created_at: string;
}

// 创建连接请求
export interface CreateConnectionRequest {
  name: string;
  db_type: DbType;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  file_path?: string;
}

// 更新连接请求
export interface UpdateConnectionRequest extends Partial<CreateConnectionRequest> {
  id: string;
}

// 连接测试结果
export interface ConnectionTestResult {
  id: string;
  success: boolean;
  latency_ms?: number;
  error?: string;
}

// 服务健康状态
export interface ServiceHealth {
  name: string;
  url: string;
  healthy: boolean;
  error?: string;
}

// 聚合健康检查
export interface AggregatedHealth {
  status: 'healthy' | 'degraded';
  timestamp: string;
  services: ServiceHealth[];
}

// API 响应通用格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  service?: string;
  timestamp?: string;
}

// 健康检查响应
export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  connections?: number;
}

// ===================== 监控相关类型 =====================

// 数据库服务器统计
export interface DatabaseStats {
  uptime_seconds: number;
  total_queries: number;
  active_connections: number;
  max_connections: number;
  slow_queries: number;
  queries_per_second: number;
  bytes_received: number;
  bytes_sent: number;
  buffer_pool_size?: number;
  server_version?: string;
  extra?: Record<string, string>;
}

// 活跃进程
export interface ProcessInfo {
  id: number;
  user: string;
  host: string;
  db?: string;
  command: string;
  time: number;
  state?: string;
  info?: string;
}

// 数据库信息
export interface DatabaseInfo {
  name: string;
  tables_count: number;
  size_mb: number;
}

// 连接池统计
export interface ConnectionPoolStats {
  active: number;
  idle: number;
  max_size: number;
  is_connected: boolean;
}

// 监控概览
export interface MonitorOverview {
  connection_id: string;
  connection_name: string;
  db_type: string;
  stats: DatabaseStats;
  pool: ConnectionPoolStats;
  timestamp: string;
}
