import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Database, 
  Server, 
  Activity, 
  CheckCircle2, 
  XCircle,
  Play,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { ConnectionList } from '../components/connections/ConnectionList';
import { ConnectionDialog } from '../components/connections/ConnectionDialog';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { GlitchText, TypeWriter } from '../components/effects/GlitchText';
import { NeonBorder } from '../components/effects/NeonBorder';
import { useResponsive } from '../hooks/useResponsive';
import { useNotification } from '../components/effects/Notification';
import { 
  getConnection, 
  testConnection, 
  deleteConnection,
  getAggregatedHealth 
} from '../api/modules/connections';
import type { ConnectionItem, AggregatedHealth } from '../types/connection';
import { cn } from '../lib/utils';

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'cyan' | 'purple' | 'pink' | 'green';
  delay?: number;
}

function StatCard({ title, value, icon, color, delay = 0 }: StatCardProps) {
  const colorMap = {
    cyan: { bg: 'bg-cyber-cyan/10', border: 'border-cyber-cyan/30', text: 'text-cyber-cyan' },
    purple: { bg: 'bg-cyber-purple/10', border: 'border-cyber-purple/30', text: 'text-cyber-purple' },
    pink: { bg: 'bg-cyber-pink/10', border: 'border-cyber-pink/30', text: 'text-cyber-pink' },
    green: { bg: 'bg-cyber-green/10', border: 'border-cyber-green/30', text: 'text-cyber-green' },
  };

  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <NeonBorder color={color} intensity="low">
        <div className={cn('p-4 rounded-lg', colors.bg)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-cyber-muted">{title}</p>
              <p className={cn('text-2xl font-bold mt-1', colors.text)}>{value}</p>
            </div>
            <div className={cn('p-3 rounded-lg', colors.bg, colors.border, 'border')}>
              {icon}
            </div>
          </div>
        </div>
      </NeonBorder>
    </motion.div>
  );
}

export function Dashboard() {
  const { id } = useParams<{ id?: string }>();
  const { isMobile } = useResponsive();
  const { success, error } = useNotification();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionItem | null>(null);
  const [health, setHealth] = useState<AggregatedHealth | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 加载选中的连接详情
  useEffect(() => {
    if (id) {
      getConnection(id)
        .then((response) => setSelectedConnection(response.data))
        .catch(() => setSelectedConnection(null));
    } else {
      setSelectedConnection(null);
    }
  }, [id]);

  // 加载健康状态
  useEffect(() => {
    getAggregatedHealth()
      .then((response) => setHealth(response.data))
      .catch(() => setHealth(null));
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
        success('连接成功', `延迟: ${result.latency_ms}ms`);
      } else {
        error('连接失败', result?.error || '无法连接到数据库');
      }
    } catch {
      setTestStatus('error');
      error('测试失败', '无法完成连接测试');
    }
  };

  // 删除连接
  const handleDeleteConnection = async () => {
    if (!selectedConnection) return;
    if (!confirm('确定要删除这个连接吗？')) return;
    
    setDeleteLoading(true);
    try {
      await deleteConnection(selectedConnection.id);
      success('删除成功', '连接已被删除');
      setSelectedConnection(null);
      window.location.href = '/dashboard';
    } catch {
      error('删除失败', '无法删除连接');
    } finally {
      setDeleteLoading(false);
    }
  };

  const healthyServices = health?.services.filter((s) => s.healthy).length || 0;
  const totalServices = health?.services.length || 0;

  return (
    <div className="h-full flex flex-col gap-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            <GlitchText text="数据库管理中心" className="text-cyber-text" />
          </h1>
          <p className="text-cyber-muted mt-1">
            <TypeWriter text="管理你的所有数据库连接" speed={30} cursor={false} />
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="服务状态"
          value={`${healthyServices}/${totalServices}`}
          icon={<Activity className="w-5 h-5 text-cyber-cyan" />}
          color="cyan"
          delay={0}
        />
        <StatCard
          title="数据库连接"
          value="--"
          icon={<Database className="w-5 h-5 text-cyber-purple" />}
          color="purple"
          delay={0.1}
        />
        <StatCard
          title="活跃会话"
          value="0"
          icon={<Server className="w-5 h-5 text-cyber-pink" />}
          color="pink"
          delay={0.2}
        />
        <StatCard
          title="系统状态"
          value={health?.status === 'healthy' ? '正常' : '异常'}
          icon={
            health?.status === 'healthy' ? (
              <CheckCircle2 className="w-5 h-5 text-cyber-green" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )
          }
          color="green"
          delay={0.3}
        />
      </div>

      {/* 主内容区 */}
      <div className={cn(
        'flex-1 grid gap-6',
        isMobile ? 'grid-cols-1' : 'grid-cols-12'
      )}>
        {/* 连接列表 */}
        <div className={cn(isMobile ? '' : 'col-span-5 xl:col-span-4')}>
          <Card className="h-full p-4">
            <ConnectionList
              activeId={id}
              onSelect={(conn) => setSelectedConnection(conn)}
            />
          </Card>
        </div>

        {/* 连接详情 */}
        {!isMobile && (
          <div className="col-span-7 xl:col-span-8">
            <Card className="h-full p-6">
              {selectedConnection ? (
                <motion.div
                  key={selectedConnection.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* 详情头部 */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-cyber-text">
                        {selectedConnection.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="cyan">
                          {selectedConnection.db_type.toUpperCase()}
                        </Badge>
                        {testStatus === 'success' && (
                          <Badge variant="green">已连接</Badge>
                        )}
                        {testStatus === 'error' && (
                          <Badge variant="red">连接失败</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleTestConnection}
                        disabled={testStatus === 'testing'}
                      >
                        {testStatus === 'testing' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        测试
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={handleDeleteConnection}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        删除
                      </Button>
                    </div>
                  </div>

                  {/* 连接信息 */}
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-cyber-bg/50 border border-cyber-border">
                    <div>
                      <span className="text-sm text-cyber-muted">主机</span>
                      <p className="text-cyber-text font-mono">
                        {selectedConnection.host || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-cyber-muted">端口</span>
                      <p className="text-cyber-text font-mono">
                        {selectedConnection.port || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-cyber-muted">用户名</span>
                      <p className="text-cyber-text font-mono">
                        {selectedConnection.username || '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-cyber-muted">数据库</span>
                      <p className="text-cyber-text font-mono">
                        {selectedConnection.database || '-'}
                      </p>
                    </div>
                    {selectedConnection.file_path && (
                      <div className="col-span-2">
                        <span className="text-sm text-cyber-muted">文件路径</span>
                        <p className="text-cyber-text font-mono">
                          {selectedConnection.file_path}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 服务状态 */}
                  {health && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-cyber-muted mb-3">
                        后端服务状态
                      </h3>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {health.services.map((service) => (
                          <motion.div
                            key={service.name}
                            className={cn(
                              'p-3 rounded-lg border',
                              service.healthy
                                ? 'bg-cyber-green/5 border-cyber-green/30'
                                : 'bg-red-500/5 border-red-500/30'
                            )}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center gap-2">
                              <motion.div
                                className={cn(
                                  'w-2 h-2 rounded-full',
                                  service.healthy ? 'bg-cyber-green' : 'bg-red-500'
                                )}
                                animate={service.healthy ? {
                                  scale: [1, 1.2, 1],
                                  opacity: [1, 0.7, 1],
                                } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              <span className="text-sm text-cyber-text">
                                {service.name}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-cyber-muted">
                  <Database className="w-16 h-16 mb-4 opacity-30" />
                  <p>选择一个连接查看详情</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* 添加连接对话框 */}
      <ConnectionDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
