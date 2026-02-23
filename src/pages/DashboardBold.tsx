import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, Activity, Terminal, Play, Trash2, Plus, ChevronRight, Server, BarChart3,
} from 'lucide-react';
import { Card, DataPanel, StatusIndicator, Button } from '../components/ui/BrutalComponents';
import { useNotification } from '../components/effects/Notification';
import { useResponsive } from '../hooks/useResponsive';
import {
  getConnections, getConnection, testConnection, deleteConnection, getAggregatedHealth,
} from '../api/modules/connections';
import type { ConnectionItem, AggregatedHealth } from '../types/connection';
import { cn } from '../lib/utils';

function ConnectionCard({
  connection, isActive, onClick,
}: {
  connection: ConnectionItem; isActive: boolean; onClick: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'relative group cursor-pointer transition-colors duration-150',
        'border-l-[3px]',
        isActive
          ? 'border-l-[var(--accent)] bg-[var(--surface-hover)]'
          : 'border-l-transparent hover:bg-[var(--surface-hover)]'
      )}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[var(--bg-t)] border border-[var(--border)]">
              <Database className="w-4 h-4 text-[var(--text-s)]" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--text)]">{connection.name}</h3>
              <p className="text-xs text-[var(--text-m)]">
                {connection.db_type.toUpperCase()} · {connection.host || connection.file_path}
              </p>
            </div>
          </div>
          <ChevronRight className={cn(
            'w-4 h-4 transition-colors',
            isActive ? 'text-[var(--text)]' : 'text-[var(--text-m)] group-hover:text-[var(--text-s)]'
          )} />
        </div>
      </div>
    </motion.div>
  );
}

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

  useEffect(() => {
    Promise.all([
      getConnections().then(r => setConnections(r.data || [])),
      getAggregatedHealth().then(r => setHealth(r.data)).catch(() => null),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (id) {
      getConnection(id).then(r => setSelectedConnection(r.data)).catch(() => setSelectedConnection(null));
    } else {
      setSelectedConnection(null);
    }
  }, [id]);

  const handleTestConnection = async () => {
    if (!selectedConnection) return;
    setTestStatus('testing');
    try {
      const response = await testConnection(selectedConnection.id);
      const result = response.data;
      setTestStatus(result?.success ? 'success' : 'error');
      if (result?.success) {
        success('Connection OK', `Latency: ${result.latency_ms}ms`);
      } else {
        error('Connection Failed', result?.error || 'Unable to reach database');
      }
    } catch {
      setTestStatus('error');
      error('Test Failed', 'Connection test encountered an error');
    }
  };

  const handleDeleteConnection = async () => {
    if (!selectedConnection) return;
    if (!confirm('Delete this connection?')) return;
    try {
      await deleteConnection(selectedConnection.id);
      success('Deleted', 'Connection removed');
      navigate('/dashboard');
      setConnections(prev => prev.filter(c => c.id !== selectedConnection.id));
      setSelectedConnection(null);
    } catch {
      error('Delete Failed', 'Unable to remove connection');
    }
  };

  const healthyServices = health?.services.filter(s => s.healthy).length || 0;
  const totalServices = health?.services.length || 0;

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Dashboard</h1>
          <p className="text-xs text-[var(--text-m)] mt-0.5">Database connections & system overview</p>
        </div>
        <Button onClick={() => navigate('/add')} variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          New Connection
        </Button>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataPanel
          label="SYSTEM STATUS"
          value={health?.status === 'healthy' ? 'ONLINE' : 'DEGRADED'}
          color={health?.status === 'healthy' ? '#22c55e' : '#f59e0b'}
        />
        <DataPanel label="ACTIVE SERVICES" value={`${healthyServices}/${totalServices}`} />
        <DataPanel label="CONNECTIONS" value={connections.length} trend="stable" />
        <DataPanel label="UPTIME" value="99.9" unit="%" trend="up" />
      </div>

      <div className={cn('grid gap-6', isMobile ? 'grid-cols-1' : 'grid-cols-12')}>
        <div className={cn(isMobile ? '' : 'col-span-4')}>
          <Card className="h-full">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[var(--text-s)]" />
                Connections
                <span className="text-xs text-[var(--text-m)] ml-auto">{connections.length}</span>
              </h2>
            </div>
            <div className="max-h-[500px] overflow-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <motion.div
                    className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent rounded-full mx-auto"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              ) : connections.length === 0 ? (
                <div className="p-8 text-center text-[var(--text-m)] text-sm">
                  No connections found
                  <br />
                  <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigate('/add')}>
                    + Add first
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
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
          </Card>
        </div>

        {!isMobile && (
          <div className="col-span-8">
            <Card className="h-full min-h-[500px]">
              <AnimatePresence mode="wait">
                {selectedConnection ? (
                  <motion.div
                    key={selectedConnection.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 h-full flex flex-col"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <StatusIndicator
                            status={testStatus === 'success' ? 'online' : testStatus === 'error' ? 'offline' : testStatus === 'testing' ? 'loading' : 'offline'}
                          />
                          <span className="text-xs text-[var(--text-m)] uppercase">
                            {testStatus === 'testing' ? 'Testing...' : testStatus.toUpperCase()}
                          </span>
                        </div>
                        <h2 className="text-lg font-semibold text-[var(--text)]">{selectedConnection.name}</h2>
                        <p className="text-sm text-[var(--text-s)] mt-0.5">{selectedConnection.db_type.toUpperCase()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={() => navigate(`/monitor/${selectedConnection.id}`)}>
                          <BarChart3 className="w-4 h-4 mr-1" /> Monitor
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleTestConnection}>
                          <Play className="w-4 h-4 mr-1" /> Test
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDeleteConnection}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { label: 'HOST', value: selectedConnection.host || '—' },
                        { label: 'PORT', value: selectedConnection.port || '—' },
                        { label: 'USERNAME', value: selectedConnection.username || '—' },
                        { label: 'DATABASE', value: selectedConnection.database || '—' },
                      ].map((item) => (
                        <div key={item.label} className="p-3 bg-[var(--bg-s)] border border-[var(--border)] rounded-md">
                          <div className="text-[10px] text-[var(--text-m)] mb-1 uppercase">{item.label}</div>
                          <div className="text-sm text-[var(--text)]">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {health && (
                      <div className="mt-auto">
                        <h3 className="text-xs text-[var(--text-m)] uppercase tracking-wider mb-3">Backend Services</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {health.services.map((service) => (
                            <div
                              key={service.name}
                              className={cn(
                                'p-2.5 border rounded-md',
                                service.healthy
                                  ? 'border-green-500/20 bg-green-500/5'
                                  : 'border-red-500/20 bg-red-500/5'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <Server className={cn('w-3.5 h-3.5', service.healthy ? 'text-green-500' : 'text-red-500')} />
                                <span className="text-xs text-[var(--text-s)] uppercase">{service.name}</span>
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
                    <div className="w-16 h-16 border-2 border-dashed border-[var(--border)] rounded-lg flex items-center justify-center mb-4">
                      <Database className="w-8 h-8 text-[var(--text-m)]" />
                    </div>
                    <p className="text-sm text-[var(--text-m)]">
                      Select a connection
                      <br />
                      <span className="text-xs">to view details</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        )}

        {isMobile && selectedConnection && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mt-4"
          >
            <Card>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-base font-semibold text-[var(--text)]">{selectedConnection.name}</h2>
                    <p className="text-xs text-[var(--text-s)] mt-0.5">{selectedConnection.db_type.toUpperCase()}</p>
                  </div>
                  <StatusIndicator
                    status={testStatus === 'success' ? 'online' : testStatus === 'error' ? 'offline' : testStatus === 'testing' ? 'loading' : 'offline'}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2.5 bg-[var(--bg-s)] border border-[var(--border)] rounded-md">
                    <div className="text-[10px] text-[var(--text-m)] mb-0.5">HOST</div>
                    <div className="text-sm text-[var(--text)] truncate">{selectedConnection.host || '—'}</div>
                  </div>
                  <div className="p-2.5 bg-[var(--bg-s)] border border-[var(--border)] rounded-md">
                    <div className="text-[10px] text-[var(--text-m)] mb-0.5">PORT</div>
                    <div className="text-sm text-[var(--text)]">{selectedConnection.port || '—'}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => navigate(`/monitor/${selectedConnection.id}`)}>
                    <BarChart3 className="w-3.5 h-3.5 mr-1" /> Monitor
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleTestConnection}>
                    <Play className="w-3.5 h-3.5 mr-1" /> Test
                  </Button>
                  <Button variant="danger" size="sm" onClick={handleDeleteConnection}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {isMobile && (
        <motion.button
          onClick={() => navigate('/add')}
          className="fixed right-6 bottom-6 z-40 w-12 h-12 bg-[var(--accent)] text-[var(--bg)] rounded-full flex items-center justify-center shadow-lg"
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
