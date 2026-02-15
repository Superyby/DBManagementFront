import { motion } from 'framer-motion';
import { Database, Server, Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { ConnectionItem as ConnectionItemType, DbType } from '../../types/connection';
import { cn } from '../../lib/utils';
import dayjs from 'dayjs';

interface ConnectionItemProps {
  connection: ConnectionItemType;
  isActive?: boolean;
  onClick?: () => void;
  onTest?: () => void;
  testStatus?: 'idle' | 'testing' | 'success' | 'error';
  index?: number;
}

// 数据库类型颜色映射
const dbTypeColors: Record<DbType, { primary: string; bg: string }> = {
  mysql: { primary: '#00758f', bg: 'rgba(0, 117, 143, 0.1)' },
  postgres: { primary: '#336791', bg: 'rgba(51, 103, 145, 0.1)' },
  sqlite: { primary: '#003b57', bg: 'rgba(0, 59, 87, 0.1)' },
  redis: { primary: '#dc382d', bg: 'rgba(220, 56, 45, 0.1)' },
  mongodb: { primary: '#47a248', bg: 'rgba(71, 162, 72, 0.1)' },
  clickhouse: { primary: '#ffcc01', bg: 'rgba(255, 204, 1, 0.1)' },
  elasticsearch: { primary: '#005571', bg: 'rgba(0, 85, 113, 0.1)' },
  oracle: { primary: '#f80000', bg: 'rgba(248, 0, 0, 0.1)' },
  sqlserver: { primary: '#cc2927', bg: 'rgba(204, 41, 39, 0.1)' },
  mariadb: { primary: '#003545', bg: 'rgba(0, 53, 69, 0.1)' },
  cassandra: { primary: '#1287b1', bg: 'rgba(18, 135, 177, 0.1)' },
  influxdb: { primary: '#22adf6', bg: 'rgba(34, 173, 246, 0.1)' },
  db2: { primary: '#054ada', bg: 'rgba(5, 74, 218, 0.1)' },
  couchdb: { primary: '#e42528', bg: 'rgba(228, 37, 40, 0.1)' },
  neo4j: { primary: '#008cc1', bg: 'rgba(0, 140, 193, 0.1)' },
  memcached: { primary: '#00875a', bg: 'rgba(0, 135, 90, 0.1)' },
  hbase: { primary: '#c72c48', bg: 'rgba(199, 44, 72, 0.1)' },
  milvus: { primary: '#00a1ea', bg: 'rgba(0, 161, 234, 0.1)' },
};

export function ConnectionItem({
  connection,
  isActive = false,
  onClick,
  onTest,
  testStatus = 'idle',
  index = 0,
}: ConnectionItemProps) {
  const colors = dbTypeColors[connection.db_type] || { primary: '#00fff2', bg: 'rgba(0, 255, 242, 0.1)' };

  // 状态图标
  const StatusIcon = () => {
    switch (testStatus) {
      case 'testing':
        return <Loader2 className="w-4 h-4 animate-spin text-cyber-cyan" />;
      case 'success':
        return <Wifi className="w-4 h-4 text-cyber-green" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        'group relative p-4 rounded-lg cursor-pointer',
        'border transition-all duration-300',
        isActive
          ? 'bg-cyber-surface border-cyber-cyan/50 shadow-[0_0_20px_rgba(0,255,242,0.15)]'
          : 'bg-cyber-surface/50 border-cyber-border hover:border-cyber-cyan/30 hover:bg-cyber-surface'
      )}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* 左侧发光条 */}
      <motion.div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
        style={{ backgroundColor: colors.primary }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: isActive ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      <div className="flex items-center gap-4">
        {/* 图标 */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.bg }}
        >
          {connection.db_type === 'redis' ? (
            <Server className="w-5 h-5" style={{ color: colors.primary }} />
          ) : (
            <Database className="w-5 h-5" style={{ color: colors.primary }} />
          )}
        </div>

        {/* 信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-cyber-text truncate">{connection.name}</h3>
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{ backgroundColor: colors.bg, color: colors.primary }}
            >
              {connection.db_type.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-cyber-muted truncate mt-0.5">
            {connection.host ? `${connection.host}:${connection.port}` : connection.file_path || '-'}
          </p>
        </div>

        {/* 状态和操作 */}
        <div className="flex items-center gap-2">
          <StatusIcon />
          
          {/* 测试按钮 */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onTest?.();
            }}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'px-3 py-1.5 text-xs rounded-md',
              'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/30',
              'hover:bg-cyber-cyan/20'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={testStatus === 'testing'}
          >
            {testStatus === 'testing' ? '测试中...' : '测试'}
          </motion.button>
        </div>
      </div>

      {/* 底部时间 */}
      <div className="mt-2 flex items-center justify-between text-xs text-cyber-muted">
        <span>创建于 {dayjs(connection.created_at).format('YYYY-MM-DD HH:mm')}</span>
      </div>

      {/* 悬停发光效果 */}
      <motion.div
        className="absolute inset-0 rounded-lg pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        style={{
          boxShadow: `0 0 30px ${colors.primary}20`,
        }}
      />
    </motion.div>
  );
}
