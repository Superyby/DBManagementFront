import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { 
  Database, 
  Cpu, 
  Activity, 
  Zap,
  Terminal,
  Play,
  Trash2,
  Plus,
  ChevronRight,
  Server,
  BarChart3,
} from 'lucide-react';
import { FloatingCard3D, DataPanel, StatusIndicator, BrutalButton } from '../components/ui/BrutalComponents';
import { LiquidBlob, MatrixRain, NoiseOverlay, ScanLines, HexGrid } from '../components/effects/LiquidBackground';
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

// 连接项组件 - 工业风格
function ConnectionCard({ 
  connection, 
  isActive, 
  onClick,
  index 
}: { 
  connection: ConnectionItem; 
  isActive: boolean;
  onClick: () => void;
  index: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    gsap.fromTo(card,
      { x: -50, opacity: 0, skewX: -5 },
      { 
        x: 0, 
        opacity: 1, 
        skewX: 0,
        duration: 0.5, 
        delay: index * 0.1,
        ease: 'power3.out' 
      }
    );
  }, [index]);

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      className={cn(
        'relative group cursor-pointer',
        'border-l-4 transition-all duration-300',
        isActive 
          ? 'border-l-cyber-cyan bg-cyber-cyan/10' 
          : 'border-l-white/20 hover:border-l-white/50 hover:bg-white/5'
      )}
      whileHover={{ x: 8 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 flex items-center justify-center',
              'bg-black/50 border border-white/20'
            )}>
              <Database className="w-5 h-5 text-cyber-cyan" />
            </div>
            <div>
              <h3 className="font-mono font-bold text-white uppercase tracking-wide">
                {connection.name}
              </h3>
              <p className="text-xs text-white/50 font-mono">
                {connection.db_type.toUpperCase()} • {connection.host || connection.file_path}
              </p>
            </div>
          </div>
          <ChevronRight className={cn(
            'w-5 h-5 transition-all',
            isActive ? 'text-cyber-cyan' : 'text-white/30 group-hover:text-white/50'
          )} />
        </div>
      </div>

      {/* 底部线条动画 */}
      <motion.div 
        className="absolute bottom-0 left-0 h-px bg-cyber-cyan"
        initial={{ width: 0 }}
        animate={{ width: isActive ? '100%' : 0 }}
        transition={{ duration: 0.3 }}
      />
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

  const titleRef = useRef<HTMLHeadingElement>(null);

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

  // 标题动画
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;

    gsap.fromTo(title,
      { y: -50, opacity: 0, skewY: 3 },
      { y: 0, opacity: 1, skewY: 0, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

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
    <div className="relative min-h-screen">
      {/* 背景效果层 */}
      <LiquidBlob colors={['#00fff2', '#bf00ff', '#ff00aa']} blur={100} />
      <HexGrid opacity={0.05} />
      <NoiseOverlay opacity={0.02} />
      <ScanLines opacity={0.05} />

      {/* 主内容 */}
      <div className="relative z-10 p-6 lg:p-8">
        {/* 头部 */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.p 
                className="text-xs font-mono text-cyber-cyan uppercase tracking-[0.3em] mb-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                DATABASE MANAGEMENT SYSTEM
              </motion.p>
              <h1 
                ref={titleRef}
                className="text-4xl lg:text-6xl font-black text-white uppercase tracking-tight"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                CONTROL
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-cyan via-cyber-purple to-cyber-pink">
                  CENTER
                </span>
              </h1>
            </div>

            <motion.div 
              className="hidden lg:flex items-center gap-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <BrutalButton onClick={() => navigate('/add')} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                NEW CONNECTION
              </BrutalButton>
            </motion.div>
          </div>
        </header>

        {/* 状态面板 */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataPanel 
            label="SYSTEM STATUS" 
            value={health?.status === 'healthy' ? 'ONLINE' : 'DEGRADED'}
            color={health?.status === 'healthy' ? '#00ff88' : '#ffaa00'}
          />
          <DataPanel 
            label="ACTIVE SERVICES" 
            value={`${healthyServices}/${totalServices}`}
            color="#00fff2"
          />
          <DataPanel 
            label="CONNECTIONS" 
            value={connections.length}
            trend="stable"
            color="#bf00ff"
          />
          <DataPanel 
            label="UPTIME" 
            value="99.9"
            unit="%"
            trend="up"
            color="#ff00aa"
          />
        </motion.div>

        {/* 主内容区 */}
        <div className={cn(
          'grid gap-6',
          isMobile ? 'grid-cols-1' : 'grid-cols-12'
        )}>
          {/* 连接列表 */}
          <div className={cn(isMobile ? '' : 'col-span-4')}>
            <FloatingCard3D borderStyle="brutal" className="h-full">
              <div className="p-4 border-b border-white/10">
                <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyber-cyan" />
                  CONNECTIONS
                </h2>
              </div>
              
              <div className="max-h-[500px] overflow-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      className="w-8 h-8 border-2 border-cyber-cyan border-t-transparent mx-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                ) : connections.length === 0 ? (
                  <div className="p-8 text-center text-white/50 font-mono">
                    NO CONNECTIONS FOUND
                    <br />
                    <BrutalButton 
                      variant="ghost" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => navigate('/add')}
                    >
                      + ADD FIRST
                    </BrutalButton>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {connections.map((conn, i) => (
                      <ConnectionCard
                        key={conn.id}
                        connection={conn}
                        isActive={id === conn.id}
                        onClick={() => navigate(`/dashboard/${conn.id}`)}
                        index={i}
                      />
                    ))}
                  </div>
                )}
              </div>
            </FloatingCard3D>
          </div>

          {/* 详情面板 */}
          {!isMobile && (
            <div className="col-span-8">
              <FloatingCard3D borderStyle="neon" className="h-full min-h-[500px]">
                <AnimatePresence mode="wait">
                  {selectedConnection ? (
                    <motion.div
                      key={selectedConnection.id}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="p-6 h-full flex flex-col"
                    >
                      {/* 详情头部 */}
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <StatusIndicator 
                              status={testStatus === 'success' ? 'online' : testStatus === 'error' ? 'offline' : testStatus === 'testing' ? 'loading' : 'offline'} 
                            />
                            <span className="text-xs font-mono text-white/50 uppercase">
                              {testStatus === 'testing' ? 'TESTING...' : testStatus.toUpperCase()}
                            </span>
                          </div>
                          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                            {selectedConnection.name}
                          </h2>
                          <p className="text-sm font-mono text-cyber-cyan mt-1">
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
                            MONITOR
                          </BrutalButton>
                          <BrutalButton 
                            variant="ghost" 
                            size="sm"
                            onClick={handleTestConnection}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            TEST
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
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-black/40 border border-white/10">
                          <div className="text-xs text-white/50 font-mono mb-1">HOST</div>
                          <div className="font-mono text-white">{selectedConnection.host || '—'}</div>
                        </div>
                        <div className="p-4 bg-black/40 border border-white/10">
                          <div className="text-xs text-white/50 font-mono mb-1">PORT</div>
                          <div className="font-mono text-white">{selectedConnection.port || '—'}</div>
                        </div>
                        <div className="p-4 bg-black/40 border border-white/10">
                          <div className="text-xs text-white/50 font-mono mb-1">USERNAME</div>
                          <div className="font-mono text-white">{selectedConnection.username || '—'}</div>
                        </div>
                        <div className="p-4 bg-black/40 border border-white/10">
                          <div className="text-xs text-white/50 font-mono mb-1">DATABASE</div>
                          <div className="font-mono text-white">{selectedConnection.database || '—'}</div>
                        </div>
                      </div>

                      {/* 服务状态 */}
                      {health && (
                        <div className="mt-auto">
                          <h3 className="text-xs font-mono text-white/50 uppercase tracking-wider mb-3">
                            BACKEND SERVICES
                          </h3>
                          <div className="grid grid-cols-4 gap-2">
                            {health.services.map((service) => (
                              <div 
                                key={service.name}
                                className={cn(
                                  'p-3 border',
                                  service.healthy 
                                    ? 'border-green-500/30 bg-green-500/5' 
                                    : 'border-red-500/30 bg-red-500/5'
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <Server className={cn(
                                    'w-4 h-4',
                                    service.healthy ? 'text-green-400' : 'text-red-400'
                                  )} />
                                  <span className="text-xs font-mono text-white/70 uppercase">
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
                      <div className="w-24 h-24 border-2 border-dashed border-white/20 flex items-center justify-center mb-6">
                        <Database className="w-10 h-10 text-white/20" />
                      </div>
                      <p className="font-mono text-white/50 uppercase tracking-wider">
                        SELECT A CONNECTION
                        <br />
                        <span className="text-xs text-white/30">TO VIEW DETAILS</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </FloatingCard3D>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
