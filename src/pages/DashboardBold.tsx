import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Activity, 
  Terminal,
  Play,
  Trash2,
  Plus,
  ChevronRight,
  Server,
  BarChart3,
} from 'lucide-react';
import { FloatingCard3D, DataPanel, StatusIndicator, BrutalButton } from '../components/ui/BrutalComponents';
import { useNotification } from '../components/effects/Notification';
import { useResponsive } from '../hooks/useResponsive';
import { 
  getConnections,
  getConnection, 
  testConnection, 
  deleteConnection,
  getAggregatedHealth 
} from '../api/modules/connections';
import type { ConnectionItem, AggregatedHealth } from '../types/connection';
import { cn } from '../lib/utils';

// 连接项组件
function ConnectionCard({ 
  connection, 
  isActive, 
  onClick,
}: { 
  connection: ConnectionItem; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative group cursor-pointer',
        'border-l-4 transition-all duration-200',
        isActive 
          ? 'border-l-blue-500 bg-blue-500/10' 
          : 'border-l-transparent hover:border-l-zinc-600 hover:bg-white/[0.02]'
      )}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded bg-zinc-800/80 border border-zinc-700/50">
              <Database className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">
                {connection.name}
              </h3>
              <p className="text-xs text-zinc-500">
                {connection.db_type.toUpperCase()} · {connection.host || connection.file_path}
              </p>
            </div>
          </div>
          <ChevronRight className={cn(
            'w-4 h-4 transition-all',
            isActive ? 'text-blue-500' : 'text-zinc-600 group-hover:text-zinc-400'
          )} />
        </div>
      </div>
    </motion.div>
  );
}

// 主 Dashboard 组件
export function DashboardBold() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { success, error } = useNotification();
  
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionItem | null>(null);
  const [health, setHealth] = useState<AggregatedHealth | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [loading, setLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    Promise.all([
      getConnections().then(r => setConnections(r.data || [])),
      getAggregatedHealth().then(r => setHealth(r.data)).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  // 加载选中的连接
  useEffect(() => {
    if (id) {
      getConnection(id)
        .then((r) => setSelectedConnection(r.data))
        .catch(() => setSelectedConnection(null));
    } else {
      setSelectedConnection(null);
    }
  }, [id]);

  // 测试连接
  const handleTestConnection = async () => {
    if (!selectedConnection) return;
    setTestStatus('testing');
    try {
      const response = await testConnection(selectedConnection.id);
      const result = response.data;
      setTestStatus(result?.success ? 'success' : 'error');
      if (result?.success) {
        success('CONNECTION ESTABLISHED', `Latency: ${result.latency_ms}ms`);
      } else {
        error('CONNECTION FAILED', result?.error || 'Unable to reach database');
      }
    } catch {
      setTestStatus('error');
      error('TEST FAILED', 'Connection test encountered an error');
    }
  };

  // 删除连接
  const handleDeleteConnection = async () => {
    if (!selectedConnection) return;
    if (!confirm('CONFIRM DELETION?')) return;
    
    try {
      await deleteConnection(selectedConnection.id);
      success('DELETED', 'Connection removed from system');
      navigate('/dashboard');
      setConnections(prev => prev.filter(c => c.id !== selectedConnection.id));
      setSelectedConnection(null);
    } catch {
      error('DELETE FAILED', 'Unable to remove connection');
    }
  };

  const healthyServices = health?.services.filter(s => s.healthy).length || 0;
  const totalServices = health?.services.length || 0;

  return (
    <div>
      {/* 头部 — 一行式 */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Database connections & system overview</p>
        </div>
        <BrutalButton onClick={() => navigate('/add')} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          New Connection
        </BrutalButton>
      </header>

      {/* 状态面板 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataPanel 
          label="SYSTEM STATUS" 
          value={health?.status === 'healthy' ? 'ONLINE' : 'DEGRADED'}
          color={health?.status === 'healthy' ? '#22c55e' : '#f59e0b'}
        />
        <DataPanel 
          label="ACTIVE SERVICES" 
          value={`${healthyServices}/${totalServices}`}
          color="#3b82f6"
        />
        <DataPanel 
          label="CONNECTIONS" 
          value={connections.length}
          trend="stable"
          color="#8b5cf6"
        />
        <DataPanel 
          label="UPTIME" 
          value="99.9"
          unit="%"
          trend="up"
          color="#ec4899"
        />
      </div>

      {/* 主内容区 */}
      <div className={cn(
        'grid gap-6',
        isMobile ? 'grid-cols-1' : 'grid-cols-12'
      )}>
        {/* 连接列表 */}
        <div className={cn(isMobile ? '' : 'col-span-4')}>
          <FloatingCard3D borderStyle="brutal" className="h-full">
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-500" />
                Connections
                <span className="text-xs text-zinc-500 ml-auto">{connections.length}</span>
              </h2>
            </div>
            
            <div className="max-h-[500px] overflow-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <motion.div
                    className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              ) : connections.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  No connections found
                  <br />
                  <BrutalButton 
                    variant="ghost" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => navigate('/add')}
                  >
                    + Add first
                  </BrutalButton>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {connections.map((conn) => (
                    <ConnectionCard
                      key={conn.id}
                      connection={conn}
                      isActive={id === conn.id}
                      onClick={() => navigate(`/dashboard/${conn.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </FloatingCard3D>
        </div>

        {/* 详情面板 - 桌面端 */}
        {!isMobile && (
          <div className="col-span-8">
            <FloatingCard3D borderStyle="neon" className="h-full min-h-[500px]">
              <AnimatePresence mode="wait">
                {selectedConnection ? (
                  <motion.div
                    key={selectedConnection.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    className="p-6 h-full flex flex-col"
                  >
                    {/* 详情头部 */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <StatusIndicator 
                            status={testStatus === 'success' ? 'online' : testStatus === 'error' ? 'offline' : testStatus === 'testing' ? 'loading' : 'offline'} 
                          />
                          <span className="text-xs text-zinc-500 uppercase">
                            {testStatus === 'testing' ? 'Testing...' : testStatus.toUpperCase()}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-white">
                          {selectedConnection.name}
                        </h2>
                        <p className="text-sm text-blue-500 mt-0.5">
                          {selectedConnection.db_type.toUpperCase()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <BrutalButton 
                          variant="primary" 
                          size="sm"
                          onClick={() => navigate(`/monitor/${selectedConnection.id}`)}
                        >
                          <BarChart3 className="w-4 h-4 mr-1" />
                          Monitor
                        </BrutalButton>
                        <BrutalButton 
                          variant="ghost" 
                          size="sm"
                          onClick={handleTestConnection}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Test
                        </BrutalButton>
                        <BrutalButton 
                          variant="danger" 
                          size="sm"
                          onClick={handleDeleteConnection}
                        >
                          <Trash2 className="w-4 h-4" />
                        </BrutalButton>
                      </div>
                    </div>

                    {/* 连接详情 */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { label: 'HOST', value: selectedConnection.host || '—' },
                        { label: 'PORT', value: selectedConnection.port || '—' },
                        { label: 'USERNAME', value: selectedConnection.username || '—' },
                        { label: 'DATABASE', value: selectedConnection.database || '—' },
                      ].map((item) => (
                        <div key={item.label} className="p-3 bg-black/30 border border-white/[0.06] rounded">
                          <div className="text-[10px] text-zinc-500 mb-1">{item.label}</div>
                          <div className="text-sm text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* 服务状态 */}
                    {health && (
                      <div className="mt-auto">
                        <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                          Backend Services
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                          {health.services.map((service) => (
                            <div 
                              key={service.name}
                              className={cn(
                                'p-2.5 border rounded',
                                service.healthy 
                                  ? 'border-green-500/20 bg-green-500/5' 
                                  : 'border-red-500/20 bg-red-500/5'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Server className={cn(
                                  'w-3.5 h-3.5',
                                  service.healthy ? 'text-green-400' : 'text-red-400'
                                )} />
                                <span className="text-xs text-zinc-400 uppercase">
                                  {service.name}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center mb-4">
                      <Database className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-sm text-zinc-500">
                      Select a connection
                      <br />
                      <span className="text-xs text-zinc-600">to view details</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </FloatingCard3D>
          </div>
        )}

        {/* 详情面板 - 移动端 */}
        {isMobile && selectedConnection && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mt-4"
          >
            <FloatingCard3D borderStyle="neon">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      {selectedConnection.name}
                    </h2>
                    <p className="text-xs text-blue-500 mt-0.5">
                      {selectedConnection.db_type.toUpperCase()}
                    </p>
                  </div>
                  <StatusIndicator 
                    status={testStatus === 'success' ? 'online' : testStatus === 'error' ? 'offline' : testStatus === 'testing' ? 'loading' : 'offline'} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 bg-black/30 border border-white/[0.06] rounded">
                    <div className="text-[10px] text-zinc-500 mb-0.5">HOST</div>
                    <div className="text-sm text-white truncate">{selectedConnection.host || '—'}</div>
                  </div>
                  <div className="p-2.5 bg-black/30 border border-white/[0.06] rounded">
                    <div className="text-[10px] text-zinc-500 mb-0.5">PORT</div>
                    <div className="text-sm text-white">{selectedConnection.port || '—'}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <BrutalButton 
                    variant="primary" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/monitor/${selectedConnection.id}`)}
                  >
                    <BarChart3 className="w-3.5 h-3.5 mr-1" />
                    Monitor
                  </BrutalButton>
                  <BrutalButton 
                    variant="ghost" 
                    size="sm"
                    onClick={handleTestConnection}
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Test
                  </BrutalButton>
                  <BrutalButton 
                    variant="danger" 
                    size="sm"
                    onClick={handleDeleteConnection}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </BrutalButton>
                </div>
              </div>
            </FloatingCard3D>
          </motion.div>
        )}
      </div>

      {/* 移动端浮动 ADD 按钮 */}
      {isMobile && (
        <motion.button
          onClick={() => navigate('/add')}
          className="fixed right-6 bottom-6 z-40 w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        >
          <Plus className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}
