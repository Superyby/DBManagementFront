import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, Search, Grid, List } from 'lucide-react';
import { ConnectionItem } from './ConnectionItem';
import { getConnections, testConnection } from '../../api/modules/connections';
import type { ConnectionItem as ConnectionItemType } from '../../types/connection';
import { useNotification } from '../effects/Notification';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface ConnectionListProps {
  activeId?: string;
  onSelect?: (connection: ConnectionItemType) => void;
  showHeader?: boolean;
}

export function ConnectionList({ 
  activeId,
  onSelect,
  showHeader = true,
}: ConnectionListProps) {
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [connections, setConnections] = useState<ConnectionItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [testStatuses, setTestStatuses] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // 加载连接列表
  const loadConnections = async () => {
    setLoading(true);
    try {
      const response = await getConnections();
      setConnections(response.data || []);
    } catch (err) {
      error('加载失败', '无法加载连接列表');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  // 测试连接
  const handleTest = async (id: string) => {
    setTestStatuses((prev) => ({ ...prev, [id]: 'testing' }));
    try {
      const response = await testConnection(id);
      const result = response.data;
      setTestStatuses((prev) => ({ ...prev, [id]: result?.success ? 'success' : 'error' }));
      if (result?.success) {
        success('连接成功', `延迟: ${result.latency_ms}ms`);
      } else {
        error('连接失败', result?.error || '无法连接');
      }
    } catch {
      setTestStatuses((prev) => ({ ...prev, [id]: 'error' }));
      error('测试失败', '无法完成连接测试');
    }
  };

  // 过滤连接
  const filteredConnections = connections.filter((conn) =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.db_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      {showHeader && (
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-cyber-text">数据库连接</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadConnections}
                disabled={loading}
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </Button>
              <Button
                variant="neon"
                size="sm"
                onClick={() => navigate('/add')}
              >
                <Plus className="w-4 h-4 mr-1" />
                添加
              </Button>
            </div>
          </div>

          {/* 搜索和视图切换 */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
              <Input
                placeholder="搜索连接..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-cyber-surface border border-cyber-border">
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded',
                  viewMode === 'list' ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'text-cyber-muted hover:text-cyber-text'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded',
                  viewMode === 'grid' ? 'bg-cyber-cyan/20 text-cyber-cyan' : 'text-cyber-muted hover:text-cyber-text'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 连接列表 */}
      <div className="flex-1 overflow-auto">
        {loading && connections.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <motion.div
              className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : filteredConnections.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-32 text-cyber-muted"
          >
            <p>{searchQuery ? '没有找到匹配的连接' : '暂无数据库连接'}</p>
            {!searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/add')}
              >
                <Plus className="w-4 h-4 mr-1" />
                添加第一个连接
              </Button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className={cn(
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 gap-3' 
                : 'flex flex-col gap-2'
            )}>
              {filteredConnections.map((connection, index) => (
                <ConnectionItem
                  key={connection.id}
                  connection={connection}
                  isActive={activeId === connection.id}
                  onClick={() => {
                    onSelect?.(connection);
                    navigate(`/dashboard/${connection.id}`);
                  }}
                  onTest={() => handleTest(connection.id)}
                  testStatus={testStatuses[connection.id] || 'idle'}
                  index={index}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
