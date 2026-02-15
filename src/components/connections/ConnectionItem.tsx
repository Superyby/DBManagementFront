import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDatabase, faServer, faCircle } from '@fortawesome/free-solid-svg-icons';
import type { ConnectionItem as ConnectionItemType, DbType, DB_TYPES } from '../../types/connection';
import dayjs from 'dayjs';

interface ConnectionItemProps {
  connection: ConnectionItemType;
  isActive?: boolean;
  onClick?: () => void;
  onTest?: () => void;
  testStatus?: 'idle' | 'testing' | 'success' | 'error';
}

// 获取数据库类型的颜色
function getDbTypeColor(dbType: DbType): string {
  const colors: Record<DbType, string> = {
    mysql: '#00758f',
    postgres: '#336791',
    sqlite: '#003b57',
    redis: '#dc382d',
    mongodb: '#47a248',
    clickhouse: '#ffcc01',
    elasticsearch: '#005571',
    oracle: '#f80000',
    sqlserver: '#cc2927',
    mariadb: '#003545',
    cassandra: '#1287b1',
    influxdb: '#22adf6',
    db2: '#054ada',
    couchdb: '#e42528',
    neo4j: '#008cc1',
    memcached: '#748c16',
    hbase: '#df0000',
    milvus: '#00a1ea',
  };
  return colors[dbType] || '#666';
}

// 获取数据库类型的显示名称
function getDbTypeName(dbType: DbType): string {
  const names: Record<DbType, string> = {
    mysql: 'MySQL',
    postgres: 'PostgreSQL',
    sqlite: 'SQLite',
    redis: 'Redis',
    mongodb: 'MongoDB',
    clickhouse: 'ClickHouse',
    elasticsearch: 'Elasticsearch',
    oracle: 'Oracle',
    sqlserver: 'SQL Server',
    mariadb: 'MariaDB',
    cassandra: 'Cassandra',
    influxdb: 'InfluxDB',
    db2: 'DB2',
    couchdb: 'CouchDB',
    neo4j: 'Neo4j',
    memcached: 'Memcached',
    hbase: 'HBase',
    milvus: 'Milvus',
  };
  return names[dbType] || dbType;
}

export function ConnectionItem({ 
  connection, 
  isActive = false, 
  onClick,
  testStatus = 'idle',
}: ConnectionItemProps) {
  const { name, db_type, host, port, database, created_at } = connection;

  // 状态指示器颜色
  const getStatusColor = () => {
    switch (testStatus) {
      case 'testing':
        return '#f8a306'; // 黄色
      case 'success':
        return '#5cdd8b'; // 绿色
      case 'error':
        return '#dc3545'; // 红色
      default:
        return '#aaa'; // 灰色
    }
  };

  return (
    <div 
      className={`item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="d-flex align-items-center">
        {/* 状态指示器 */}
        <FontAwesomeIcon 
          icon={faCircle} 
          style={{ 
            fontSize: '8px', 
            color: getStatusColor(),
            marginRight: '10px',
          }}
        />

        {/* 数据库图标 */}
        <FontAwesomeIcon 
          icon={db_type === 'redis' || db_type === 'memcached' ? faServer : faDatabase}
          style={{ 
            color: getDbTypeColor(db_type),
            marginRight: '12px',
            fontSize: '18px',
          }}
        />

        {/* 连接信息 */}
        <div className="info flex-grow-1">
          <div className="d-flex align-items-center justify-content-between">
            <strong>{name}</strong>
            <span 
              className="db-badge"
              style={{ backgroundColor: getDbTypeColor(db_type) }}
            >
              {getDbTypeName(db_type)}
            </span>
          </div>
          <div className="text-muted small mt-1">
            {host && port ? `${host}:${port}` : ''}
            {database ? ` / ${database}` : ''}
            {!host && connection.file_path ? connection.file_path : ''}
          </div>
          <div className="text-muted small">
            创建于 {dayjs(created_at).format('YYYY-MM-DD HH:mm')}
          </div>
        </div>
      </div>
    </div>
  );
}
