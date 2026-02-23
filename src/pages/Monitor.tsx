import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Activity, Database, Cpu, Clock, Zap,
  HardDrive, Users, AlertTriangle, RefreshCw, Pause,
  Play, Server, Wifi, BarChart3, Layers,
} from 'lucide-react';
import { Card, DataPanel, StatusIndicator, Button } from '../components/ui/BrutalComponents';
import { useNotification } from '../components/effects/Notification';
import { getConnections, getConnectionStats, getConnectionDatabases, getConnectionProcesses } from '../api/modules/connections';
import type { ConnectionItem } from '../types/connection';
import type { MonitorOverview, DatabaseInfo, ProcessInfo } from '../types/connection';
import { cn } from '../lib/utils';

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) { const h = Math.floor(seconds / 3600); const m = Math.floor((seconds % 3600) / 60); return `${h}h ${m}m`; }
  const d = Math.floor(seconds / 86400); const h = Math.floor((seconds % 86400) / 3600); return `${d}d ${h}h`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

function SimpleChart({ data, label, color = '#22c55e', height = 100 }: { data: number[]; label: string; color?: string; height?: number }) {
  const width = 400;
  const p = { top: 10, right: 10, bottom: 20, left: 40 };
  const cW = width - p.left - p.right;
  const cH = height - p.top - p.bottom;
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = p.left + (i / Math.max(data.length - 1, 1)) * cW;
    const y = p.top + cH - (v / max) * cH;
    return `${x},${y}`;
  });
  const areaPoints = [`${p.left},${p.top + cH}`, ...points, `${p.left + cW},${p.top + cH}`];
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({ y: p.top + cH * (1 - pct), val: (max * pct).toFixed(0) }));

  return (
    <div className="w-full">
      <div className="text-[10px] text-[var(--text-m)] uppercase tracking-widest mb-1">{label}</div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        {gridLines.map((g, i) => (
          <g key={i}>
            <line x1={p.left} y1={g.y} x2={p.left + cW} y2={g.y} stroke="var(--ring)" strokeDasharray="4 4" />
            <text x={p.left - 5} y={g.y + 3} textAnchor="end" fill="var(--text-m)" fontSize="8" fontFamily="monospace">{g.val}</text>
          </g>
        ))}
        {data.length > 1 && <polygon points={areaPoints.join(' ')} fill={`url(#gr-${label.replace(/\s/g, '')})`} />}
        {data.length > 1 && <polyline points={points.join(' ')} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />}
        {data.length > 0 && (
          <>
            <circle cx={parseFloat(points[points.length - 1]?.split(',')[0] || '0')} cy={parseFloat(points[points.length - 1]?.split(',')[1] || '0')} r="3" fill={color} />
            <circle cx={parseFloat(points[points.length - 1]?.split(',')[0] || '0')} cy={parseFloat(points[points.length - 1]?.split(',')[1] || '0')} r="6" fill={color} opacity="0.2" />
          </>
        )}
        <defs>
          <linearGradient id={`gr-${label.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function RingGauge({ value, max, label, color = '#3b82f6', size = 100 }: { value: number; max: number; label: string; color?: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--ring)" strokeWidth="6" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
          <span className="text-[9px] text-[var(--text-m)] font-mono">/{max}</span>
        </div>
      </div>
      <span className="text-[10px] text-[var(--text-m)] uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

function ConnectionPicker() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConnections().then((r) => setConnections(r.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const dbTypeIcon: Record<string, string> = {
    mysql: '🐬', postgres: '🐘', sqlite: '📦', redis: '🔴', mongodb: '🍃', clickhouse: '⚡', elasticsearch: '🔍',
  };

  return (
    <div>
      <header className="flex items-center gap-4 mb-6">
        <motion.button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-[var(--text-m)] hover:text-[var(--text)] text-sm transition-colors" whileHover={{ x: -2 }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </motion.button>
        <div className="w-px h-5 bg-[var(--border)]" />
        <div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Select Connection</h1>
          <p className="text-xs text-[var(--text-m)] mt-0.5">Choose a connection to monitor</p>
        </div>
      </header>
      {loading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="w-5 h-5 text-[var(--text-s)] animate-spin" /></div>
      ) : connections.length === 0 ? (
        <div className="text-center py-20">
          <Database className="w-10 h-10 text-[var(--text-m)] mx-auto mb-3" />
          <p className="text-sm text-[var(--text-m)] mb-3">No connections found</p>
          <Button variant="primary" onClick={() => navigate('/add')}>Add Connection</Button>
        </div>
      ) : (
        <div className="grid gap-2 max-w-3xl">
          {connections.map((conn, i) => (
            <motion.div key={conn.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <button
                onClick={() => navigate(`/monitor/${conn.id}`)}
                className="w-full text-left group p-4 border border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--surface)] rounded-md transition-all duration-150 hover:bg-[var(--surface-hover)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{dbTypeIcon[conn.db_type.toLowerCase()] || '💾'}</span>
                    <div>
                      <div className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--text)] transition-colors">{conn.name}</div>
                      <div className="text-xs text-[var(--text-m)] mt-0.5">
                        {conn.db_type.toUpperCase()}
                        {conn.host && <span className="ml-2">{conn.host}:{conn.port}</span>}
                        {conn.database && <span className="ml-2">/ {conn.database}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--text-m)] group-hover:text-[var(--text-s)] transition-colors">
                    <BarChart3 className="w-4 h-4" /><span className="text-xs">Monitor</span>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Monitor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { error: notifyError } = useNotification();

  const [overview, setOverview] = useState<MonitorOverview | null>(null);
  const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCount, setRefreshCount] = useState(0);
  const [qpsHistory, setQpsHistory] = useState<number[]>([]);
  const [connHistory, setConnHistory] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [statsRes, dbRes, procRes] = await Promise.all([
        getConnectionStats(id),
        getConnectionDatabases(id).catch(() => ({ data: [] as DatabaseInfo[] })),
        getConnectionProcesses(id).catch(() => ({ data: [] as ProcessInfo[] })),
      ]);
      if (statsRes.data) {
        setOverview(statsRes.data);
        setQpsHistory((prev) => [...prev.slice(-29), statsRes.data!.stats.queries_per_second]);
        setConnHistory((prev) => [...prev.slice(-29), statsRes.data!.stats.active_connections]);
      }
      setDatabases(dbRes.data || []);
      setProcesses(procRes.data || []);
    } catch (err: any) {
      if (loading) notifyError('Monitor Error', err?.parsedMessage || err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  }, [id, loading]);

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    if (!autoRefresh || !id) return;
    const interval = setInterval(() => { fetchData(); setRefreshCount((c) => c + 1); }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, id, fetchData]);

  const stats = overview?.stats;
  const pool = overview?.pool;

  if (!id) return <ConnectionPicker />;

  return (
    <div>
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.button onClick={() => navigate(`/dashboard/${id}`)} className="flex items-center gap-1.5 text-[var(--text-m)] hover:text-[var(--text)] text-sm transition-colors" whileHover={{ x: -2 }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
          <div className="w-px h-5 bg-[var(--border)]" />
          <div>
            <h1 className="text-xl font-semibold text-[var(--text)]">Performance Monitor</h1>
            {overview && <p className="text-xs text-[var(--text-m)] mt-0.5">{overview.connection_name} · {overview.db_type.toUpperCase()}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {overview && <StatusIndicator status={pool?.is_connected ? 'online' : 'offline'} />}
          <Button variant={autoRefresh ? 'primary' : 'ghost'} size="sm" onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="w-3 h-3" /></Button>
        </div>
      </header>

      {autoRefresh && (
        <motion.div className="h-px bg-[var(--accent)] mb-5" style={{ opacity: 0.2 }} key={refreshCount} initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'linear' }} />
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <motion.div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </div>
      ) : !overview ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
          <p className="text-sm text-[var(--text-s)]">No data available</p>
          <p className="text-xs text-[var(--text-m)] mt-1">Connection pool may not be established yet</p>
          <Button variant="ghost" size="sm" className="mt-3" onClick={fetchData}>Retry</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DataPanel label="ACTIVE CONNECTIONS" value={stats?.active_connections || 0} color="#3b82f6" />
            <DataPanel label="QUERIES / SEC" value={Number((stats?.queries_per_second || 0).toFixed(1))} color="#22c55e" />
            <DataPanel label="UPTIME" value={formatUptime(stats?.uptime_seconds || 0)} />
            <DataPanel label="SLOW QUERIES" value={stats?.slow_queries || 0} color={stats?.slow_queries && stats.slow_queries > 0 ? '#ef4444' : '#22c55e'} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-8">
              <Card>
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-green-500" /> Realtime Metrics
                  </h2>
                </div>
                <div className="p-4 space-y-4">
                  <SimpleChart data={qpsHistory} label="Queries Per Second" color="#22c55e" height={100} />
                  <SimpleChart data={connHistory} label="Active Connections" color="#3b82f6" height={100} />
                </div>
              </Card>
            </div>
            <div className="lg:col-span-4">
              <Card className="h-full">
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[var(--text-s)]" /> Connection Pool
                  </h2>
                </div>
                <div className="p-5 flex flex-col items-center gap-4">
                  <RingGauge value={pool?.active || 0} max={pool?.max_size || 1} label="ACTIVE" color="#3b82f6" size={100} />
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <div className="p-3 bg-[var(--bg-s)] border border-[var(--border)] rounded-md text-center">
                      <div className="text-[10px] text-[var(--text-m)] mb-1">IDLE</div>
                      <div className="text-lg font-bold font-mono text-green-500">{pool?.idle || 0}</div>
                    </div>
                    <div className="p-3 bg-[var(--bg-s)] border border-[var(--border)] rounded-md text-center">
                      <div className="text-[10px] text-[var(--text-m)] mb-1">MAX</div>
                      <div className="text-lg font-bold font-mono text-[var(--text)]">{pool?.max_size || 0}</div>
                    </div>
                  </div>
                  <div className="w-full space-y-2 mt-2">
                    {stats?.server_version && (
                      <div className="flex justify-between text-xs"><span className="text-[var(--text-m)]">VERSION</span><span className="text-blue-500">{stats.server_version}</span></div>
                    )}
                    <div className="flex justify-between text-xs"><span className="text-[var(--text-m)]">MAX CONN</span><span className="text-[var(--text)]">{stats?.max_connections || '—'}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-[var(--text-m)]">TOTAL QUERIES</span><span className="text-[var(--text)]">{(stats?.total_queries || 0).toLocaleString()}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-[var(--text-m)]">BYTES IN</span><span className="text-[var(--text)]">{formatBytes(stats?.bytes_received || 0)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-[var(--text-m)]">BYTES OUT</span><span className="text-[var(--text)]">{formatBytes(stats?.bytes_sent || 0)}</span></div>
                    {stats?.buffer_pool_size != null && (
                      <div className="flex justify-between text-xs"><span className="text-[var(--text-m)]">BUFFER POOL</span><span className="text-[var(--text)]">{formatBytes(stats.buffer_pool_size)}</span></div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" /> Databases
                  <span className="text-xs text-[var(--text-m)] ml-auto">{databases.length}</span>
                </h2>
              </div>
              <div className="max-h-[320px] overflow-auto">
                {databases.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-m)] text-sm">No database info</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left text-[10px] text-[var(--text-m)] uppercase tracking-wider p-3">Name</th>
                        <th className="text-right text-[10px] text-[var(--text-m)] uppercase tracking-wider p-3">Tables</th>
                        <th className="text-right text-[10px] text-[var(--text-m)] uppercase tracking-wider p-3">Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      {databases.map((db) => (
                        <tr key={db.name} className="border-b border-[var(--ring)] hover:bg-[var(--surface-hover)] transition-colors">
                          <td className="p-3"><div className="flex items-center gap-2"><HardDrive className="w-3 h-3 text-[var(--text-m)]" /><span className="text-sm text-[var(--text)]">{db.name}</span></div></td>
                          <td className="p-3 text-right text-sm text-[var(--text-s)]">{db.tables_count}</td>
                          <td className="p-3 text-right text-sm text-green-500">{db.size_mb.toFixed(2)} MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>

            <Card>
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[var(--text-s)]" /> Active Processes
                  <span className="text-xs text-[var(--text-m)] ml-auto">{processes.length}</span>
                </h2>
              </div>
              <div className="max-h-[320px] overflow-auto">
                {processes.length === 0 ? (
                  <div className="p-6 text-center text-[var(--text-m)] text-sm">No active processes</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left text-[10px] text-[var(--text-m)] uppercase tracking-wider p-3">ID</th>
                        <th className="text-left text-[10px] text-[var(--text-m)] uppercase tracking-wider p-3">User</th>
                        <th className="text-left text-[10px] text-[var(--text-m)] uppercase tracking-wider p-3">Cmd</th>
                        <th className="text-right text-[10px] text-[var(--text-m)] uppercase tracking-wider p-3">Time</th>
                        <th className="text-left text-[10px] text-[var(--text-m)] uppercase tracking-wider p-3">Info</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processes.map((proc) => (
                        <tr key={proc.id} className={cn('border-b border-[var(--ring)] hover:bg-[var(--surface-hover)] transition-colors', proc.time > 60 && 'bg-red-500/5')}>
                          <td className="p-3 text-xs text-[var(--text-m)]">{proc.id}</td>
                          <td className="p-3 text-xs text-[var(--text)]">{proc.user}</td>
                          <td className="p-3">
                            <span className={cn(
                              'text-xs px-1.5 py-0.5 border rounded',
                              proc.command === 'Query' ? 'border-green-500/30 text-green-500 bg-green-500/10' :
                              proc.command === 'Sleep' ? 'border-[var(--border)] text-[var(--text-m)]' :
                              'border-blue-500/30 text-blue-500'
                            )}>{proc.command}</span>
                          </td>
                          <td className={cn('p-3 text-right text-xs', proc.time > 60 ? 'text-red-500' : 'text-[var(--text-m)]')}>{proc.time}s</td>
                          <td className="p-3 text-xs text-[var(--text-m)] max-w-[200px] truncate">{proc.info || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
