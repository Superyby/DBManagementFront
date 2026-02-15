import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  ArrowLeft, Activity, Database, Cpu, Clock, Zap,
  HardDrive, Users, AlertTriangle, RefreshCw, Pause,
  Play, Server, Wifi, BarChart3, Layers,
} from 'lucide-react';
import { FloatingCard3D, DataPanel, StatusIndicator, BrutalButton } from '../components/ui/BrutalComponents';
import { LiquidBlob, NoiseOverlay, ScanLines, HexGrid } from '../components/effects/LiquidBackground';
import { useNotification } from '../components/effects/Notification';
import { getConnectionStats, getConnectionDatabases, getConnectionProcesses } from '../api/modules/connections';
import type { MonitorOverview, DatabaseInfo, ProcessInfo } from '../types/connection';
import { cn } from '../lib/utils';

// 格式化 uptime
function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  if (seconds < 86400) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  }
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  return `${d}d ${h}h`;
}

// 格式化字节数
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

// ========== 赛博风格折线图组件 ==========
function CyberChart({
  data,
  label,
  color = '#00fff2',
  height = 120,
}: {
  data: number[];
  label: string;
  color?: string;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const width = 400;
  const padding = { top: 10, right: 10, bottom: 20, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = padding.left + (i / Math.max(data.length - 1, 1)) * chartW;
    const y = padding.top + chartH - (v / max) * chartH;
    return `${x},${y}`;
  });

  const areaPoints = [
    `${padding.left},${padding.top + chartH}`,
    ...points,
    `${padding.left + chartW},${padding.top + chartH}`,
  ];

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const y = padding.top + chartH * (1 - pct);
    const val = (max * pct).toFixed(0);
    return { y, val };
  });

  return (
    <div className="w-full">
      <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">
        {label}
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height }}
      >
        {/* Grid */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={padding.left}
              y1={g.y}
              x2={padding.left + chartW}
              y2={g.y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 5}
              y={g.y + 3}
              textAnchor="end"
              fill="rgba(255,255,255,0.3)"
              fontSize="8"
              fontFamily="monospace"
            >
              {g.val}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {data.length > 1 && (
          <polygon
            points={areaPoints.join(' ')}
            fill={`url(#gradient-${label.replace(/\s/g, '')})`}
          />
        )}

        {/* Line */}
        {data.length > 1 && (
          <polyline
            points={points.join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}

        {/* Glow dots at last point */}
        {data.length > 0 && (
          <>
            <circle
              cx={parseFloat(points[points.length - 1]?.split(',')[0] || '0')}
              cy={parseFloat(points[points.length - 1]?.split(',')[1] || '0')}
              r="4"
              fill={color}
            />
            <circle
              cx={parseFloat(points[points.length - 1]?.split(',')[0] || '0')}
              cy={parseFloat(points[points.length - 1]?.split(',')[1] || '0')}
              r="8"
              fill={color}
              opacity="0.3"
            />
          </>
        )}

        {/* Gradient def */}
        <defs>
          <linearGradient
            id={`gradient-${label.replace(/\s/g, '')}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ========== 环形进度条 ==========
function RingGauge({
  value,
  max,
  label,
  color = '#00fff2',
  size = 100,
}: {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: number;
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
        />
        {/* Value ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease-out', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-xl font-bold font-mono" style={{ color }}>{value}</span>
        <span className="text-[9px] text-white/40 font-mono">/{max}</span>
      </div>
      <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

// ========== 主组件 ==========
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

  // 历史数据用于图表
  const [qpsHistory, setQpsHistory] = useState<number[]>([]);
  const [connHistory, setConnHistory] = useState<number[]>([]);

  const titleRef = useRef<HTMLHeadingElement>(null);

  // 标题动画
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    gsap.fromTo(el,
      { y: -40, opacity: 0, skewY: 2 },
      { y: 0, opacity: 1, skewY: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  // 拉取数据
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
      if (loading) {
        notifyError('MONITOR ERROR', err?.parsedMessage || err?.message || 'Failed to load monitoring data');
      }
    } finally {
      setLoading(false);
    }
  }, [id, loading]);

  // 初次加载
  useEffect(() => {
    fetchData();
  }, [id]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !id) return;
    const interval = setInterval(() => {
      fetchData();
      setRefreshCount((c) => c + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, id, fetchData]);

  const stats = overview?.stats;
  const pool = overview?.pool;

  return (
    <div className="relative min-h-screen">
      {/* 背景 */}
      <LiquidBlob colors={['#00fff2', '#bf00ff', '#00ff88']} blur={120} speed={20} />
      <HexGrid opacity={0.04} />
      <NoiseOverlay opacity={0.02} />
      <ScanLines opacity={0.04} />

      <div className="relative z-10 p-6 lg:p-8">
        {/* 头部 */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.button
                onClick={() => navigate(`/dashboard/${id}`)}
                className="flex items-center gap-2 text-white/40 hover:text-cyber-cyan mb-3 font-mono text-sm uppercase tracking-wider transition-colors"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="w-4 h-4" />
                BACK TO DASHBOARD
              </motion.button>
              <h1 ref={titleRef} className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tight">
                PERFORMANCE
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-green via-cyber-cyan to-cyber-purple">
                  MONITOR
                </span>
              </h1>
            </div>

            {/* 右上角控制 */}
            <div className="hidden lg:flex items-center gap-4">
              {overview && (
                <div className="flex items-center gap-3">
                  <StatusIndicator status={pool?.is_connected ? 'online' : 'offline'} />
                  <div className="text-right">
                    <div className="font-mono font-bold text-white text-sm">{overview.connection_name}</div>
                    <div className="text-xs font-mono text-cyber-cyan">{overview.db_type.toUpperCase()}</div>
                  </div>
                </div>
              )}
              <div className="h-8 w-px bg-white/10" />
              <BrutalButton
                variant={autoRefresh ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? <Pause className="w-3 h-3 mr-1" /> : <Play className="w-3 h-3 mr-1" />}
                {autoRefresh ? 'LIVE' : 'PAUSED'}
              </BrutalButton>
              <BrutalButton variant="ghost" size="sm" onClick={fetchData}>
                <RefreshCw className="w-3 h-3" />
              </BrutalButton>
            </div>
          </div>

          {/* 刷新指示条 */}
          {autoRefresh && (
            <motion.div
              className="h-px bg-cyber-cyan/50 mt-4"
              key={refreshCount}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          )}
        </header>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              className="w-16 h-16 border-2 border-cyber-cyan border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        ) : !overview ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <AlertTriangle className="w-12 h-12 text-cyber-red mb-4" />
            <p className="font-mono text-white/50">NO DATA AVAILABLE</p>
            <p className="font-mono text-xs text-white/30 mt-2">Connection pool may not be established yet</p>
            <BrutalButton variant="ghost" size="sm" className="mt-4" onClick={fetchData}>
              RETRY
            </BrutalButton>
          </div>
        ) : (
          <>
            {/* KPI 面板 - 4列 */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <DataPanel
                label="ACTIVE CONNECTIONS"
                value={stats?.active_connections || 0}
                color="#00fff2"
              />
              <DataPanel
                label="QUERIES / SEC"
                value={Number((stats?.queries_per_second || 0).toFixed(1))}
                color="#00ff88"
              />
              <DataPanel
                label="UPTIME"
                value={formatUptime(stats?.uptime_seconds || 0)}
                color="#bf00ff"
              />
              <DataPanel
                label="SLOW QUERIES"
                value={stats?.slow_queries || 0}
                color={stats?.slow_queries && stats.slow_queries > 0 ? '#ff0055' : '#00ff88'}
              />
            </motion.div>

            {/* 中间区域 - 图表 + 连接池 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
              {/* 图表 */}
              <div className="lg:col-span-8">
                <FloatingCard3D borderStyle="neon" depth={4}>
                  <div className="p-4 border-b border-white/10">
                    <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-cyber-green" />
                      REALTIME METRICS
                    </h2>
                  </div>
                  <div className="p-4 space-y-4">
                    <CyberChart
                      data={qpsHistory}
                      label="Queries Per Second"
                      color="#00ff88"
                      height={100}
                    />
                    <CyberChart
                      data={connHistory}
                      label="Active Connections"
                      color="#00fff2"
                      height={100}
                    />
                  </div>
                </FloatingCard3D>
              </div>

              {/* 连接池状态 */}
              <div className="lg:col-span-4">
                <FloatingCard3D borderStyle="brutal" depth={6} className="h-full">
                  <div className="p-4 border-b border-white/10">
                    <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyber-purple" />
                      CONNECTION POOL
                    </h2>
                  </div>
                  <div className="p-6 flex flex-col items-center gap-4">
                    <div className="relative">
                      <RingGauge
                        value={pool?.active || 0}
                        max={pool?.max_size || 1}
                        label="ACTIVE"
                        color="#00fff2"
                        size={110}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <div className="p-3 bg-black/40 border border-white/10 text-center">
                        <div className="text-[10px] text-white/40 font-mono mb-1">IDLE</div>
                        <div className="text-lg font-bold font-mono text-cyber-green">{pool?.idle || 0}</div>
                      </div>
                      <div className="p-3 bg-black/40 border border-white/10 text-center">
                        <div className="text-[10px] text-white/40 font-mono mb-1">MAX</div>
                        <div className="text-lg font-bold font-mono text-cyber-purple">{pool?.max_size || 0}</div>
                      </div>
                    </div>

                    {/* 额外指标 */}
                    <div className="w-full space-y-2 mt-2">
                      {stats?.server_version && (
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/40">VERSION</span>
                          <span className="text-cyber-cyan">{stats.server_version}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-white/40">MAX CONN</span>
                        <span className="text-white">{stats?.max_connections || '—'}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-white/40">TOTAL QUERIES</span>
                        <span className="text-white">{(stats?.total_queries || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-white/40">BYTES IN</span>
                        <span className="text-white">{formatBytes(stats?.bytes_received || 0)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-white/40">BYTES OUT</span>
                        <span className="text-white">{formatBytes(stats?.bytes_sent || 0)}</span>
                      </div>
                      {stats?.buffer_pool_size != null && (
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-white/40">BUFFER POOL</span>
                          <span className="text-white">{formatBytes(stats.buffer_pool_size)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </FloatingCard3D>
              </div>
            </div>

            {/* 底部 - 数据库列表 + 进程列表 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 数据库列表 */}
              <FloatingCard3D borderStyle="brutal" depth={4}>
                <div className="p-4 border-b border-white/10">
                  <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyber-cyan" />
                    DATABASES
                    <span className="text-xs text-white/30 ml-auto">{databases.length}</span>
                  </h2>
                </div>
                <div className="max-h-[320px] overflow-auto">
                  {databases.length === 0 ? (
                    <div className="p-6 text-center text-white/30 font-mono text-sm">
                      NO DATABASE INFO
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-[10px] font-mono text-white/40 uppercase tracking-wider p-3">NAME</th>
                          <th className="text-right text-[10px] font-mono text-white/40 uppercase tracking-wider p-3">TABLES</th>
                          <th className="text-right text-[10px] font-mono text-white/40 uppercase tracking-wider p-3">SIZE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {databases.map((db, i) => (
                          <motion.tr
                            key={db.name}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <HardDrive className="w-3 h-3 text-cyber-cyan/60" />
                                <span className="font-mono text-sm text-white">{db.name}</span>
                              </div>
                            </td>
                            <td className="p-3 text-right font-mono text-sm text-white/70">{db.tables_count}</td>
                            <td className="p-3 text-right font-mono text-sm text-cyber-green">{db.size_mb.toFixed(2)} MB</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </FloatingCard3D>

              {/* 进程列表 */}
              <FloatingCard3D borderStyle="neon" depth={4}>
                <div className="p-4 border-b border-white/10">
                  <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyber-purple" />
                    ACTIVE PROCESSES
                    <span className="text-xs text-white/30 ml-auto">{processes.length}</span>
                  </h2>
                </div>
                <div className="max-h-[320px] overflow-auto">
                  {processes.length === 0 ? (
                    <div className="p-6 text-center text-white/30 font-mono text-sm">
                      NO ACTIVE PROCESSES
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-[10px] font-mono text-white/40 uppercase tracking-wider p-3">ID</th>
                          <th className="text-left text-[10px] font-mono text-white/40 uppercase tracking-wider p-3">USER</th>
                          <th className="text-left text-[10px] font-mono text-white/40 uppercase tracking-wider p-3">CMD</th>
                          <th className="text-right text-[10px] font-mono text-white/40 uppercase tracking-wider p-3">TIME</th>
                          <th className="text-left text-[10px] font-mono text-white/40 uppercase tracking-wider p-3">INFO</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processes.map((proc, i) => (
                          <motion.tr
                            key={proc.id}
                            className={cn(
                              'border-b border-white/5 hover:bg-white/5 transition-colors',
                              proc.time > 60 && 'bg-cyber-red/5'
                            )}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <td className="p-3 font-mono text-xs text-white/60">{proc.id}</td>
                            <td className="p-3 font-mono text-xs text-white">{proc.user}</td>
                            <td className="p-3">
                              <span className={cn(
                                'font-mono text-xs px-1.5 py-0.5 border',
                                proc.command === 'Query' ? 'border-cyber-green/30 text-cyber-green bg-cyber-green/10' :
                                proc.command === 'Sleep' ? 'border-white/10 text-white/40' :
                                'border-cyber-cyan/30 text-cyber-cyan'
                              )}>
                                {proc.command}
                              </span>
                            </td>
                            <td className={cn(
                              'p-3 text-right font-mono text-xs',
                              proc.time > 60 ? 'text-cyber-red' : 'text-white/60'
                            )}>
                              {proc.time}s
                            </td>
                            <td className="p-3 font-mono text-xs text-white/50 max-w-[200px] truncate">
                              {proc.info || '—'}
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </FloatingCard3D>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
