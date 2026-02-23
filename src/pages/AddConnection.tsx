import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import {
  ArrowLeft, Save, Loader2, Database, Server, Zap,
  Globe, Lock, User, HardDrive, ChevronRight, CheckCircle2,
  AlertTriangle, Wifi,
} from 'lucide-react';
import { createConnection, testConnection as apiTestConnection } from '../api/modules/connections';
import type { CreateConnectionRequest, DbType } from '../types/connection';
import { useNotification } from '../components/effects/Notification';
import { FloatingCard3D, BrutalButton, DataPanel } from '../components/ui/BrutalComponents';
import { LiquidBlob, NoiseOverlay, ScanLines, HexGrid } from '../components/effects/LiquidBackground';
import { cn } from '../lib/utils';

// 数据库类型配置
const DB_TYPES: {
  value: DbType;
  label: string;
  defaultPort?: number;
  color: string;
  icon: string;
  desc: string;
}[] = [
  { value: 'mysql', label: 'MySQL', defaultPort: 3306, color: '#00758f', icon: '🐬', desc: 'Relational DB' },
  { value: 'postgres', label: 'PostgreSQL', defaultPort: 5432, color: '#336791', icon: '🐘', desc: 'Advanced SQL' },
  { value: 'sqlite', label: 'SQLite', defaultPort: undefined, color: '#003b57', icon: '📦', desc: 'File-based' },
  { value: 'redis', label: 'Redis', defaultPort: 6379, color: '#dc382d', icon: '⚡', desc: 'Key-Value' },
  { value: 'mongodb', label: 'MongoDB', defaultPort: 27017, color: '#47a248', icon: '🍃', desc: 'Document DB' },
  { value: 'mariadb', label: 'MariaDB', defaultPort: 3306, color: '#003545', icon: '🔷', desc: 'MySQL Fork' },
  { value: 'sqlserver', label: 'SQL Server', defaultPort: 1433, color: '#cc2927', icon: '🏢', desc: 'Enterprise' },
  { value: 'oracle', label: 'Oracle', defaultPort: 1521, color: '#f80000', icon: '🔴', desc: 'Enterprise DB' },
  { value: 'clickhouse', label: 'ClickHouse', defaultPort: 8123, color: '#ffcc01', icon: '🏠', desc: 'Analytics' },
  { value: 'elasticsearch', label: 'Elastic', defaultPort: 9200, color: '#005571', icon: '🔍', desc: 'Search Engine' },
];

// 步骤配置
const STEPS = [
  { id: 1, label: 'TYPE', desc: '选择数据库' },
  { id: 2, label: 'CONFIG', desc: '连接配置' },
  { id: 3, label: 'VERIFY', desc: '验证测试' },
];

export function AddConnection() {
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateConnectionRequest>({
    name: '',
    db_type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: '',
    password: '',
    database: '',
  });

  const titleRef = useRef<HTMLHeadingElement>(null);
  const isFileBasedDb = formData.db_type === 'sqlite';
  const selectedType = DB_TYPES.find((t) => t.value === formData.db_type);

  // 标题动画
  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    gsap.fromTo(title,
      { y: -40, opacity: 0, skewY: 2 },
      { y: 0, opacity: 1, skewY: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  const handleTypeChange = (type: DbType) => {
    const dbType = DB_TYPES.find((t) => t.value === type);
    setFormData((prev) => ({
      ...prev,
      db_type: type,
      port: dbType?.defaultPort || prev.port,
      file_path: type === 'sqlite' ? prev.file_path || '' : undefined,
    }));
  };

  // 创建连接
  const handleCreate = async () => {
    setLoading(true);
    try {
      const result = await createConnection(formData);
      setCreatedId(result.data?.id || null);
      success('CONNECTION SAVED', `${formData.name} has been registered`);
      setStep(3);
    } catch (err: any) {
      const msg = err?.parsedMessage || err?.message || '创建失败';
      notifyError('CREATE FAILED', msg);
    } finally {
      setLoading(false);
    }
  };

  // 测试连接
  const handleTest = async () => {
    if (!createdId) return;
    setTestStatus('testing');
    setTestError('');
    try {
      const result = await apiTestConnection(createdId);
      if (result.data?.success) {
        setTestStatus('success');
        success('CONNECTION OK', `Latency: ${result.data.latency_ms}ms`);
      } else {
        setTestStatus('error');
        setTestError(result.data?.error || 'Connection failed');
        notifyError('TEST FAILED', result.data?.error || 'Unable to reach database');
      }
    } catch (err: any) {
      setTestStatus('error');
      const msg = err?.parsedMessage || err?.message || 'Test failed';
      setTestError(msg);
      notifyError('TEST ERROR', msg);
    }
  };

  const canProceedStep2 = formData.name.trim() !== '' && (
    isFileBasedDb ? (formData.file_path || '').trim() !== '' : (formData.host || '').trim() !== ''
  );

  return (
    <div className="relative min-h-screen">
      {/* 背景 */}
      <LiquidBlob colors={['#8b5cf6', '#3b82f6', '#6366f1']} blur={120} speed={25} />
      <HexGrid opacity={0.04} />
      <NoiseOverlay opacity={0.02} />
      <ScanLines opacity={0.04} />

      <div className="relative z-10 p-6 lg:p-8">
        {/* 头部 */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <motion.button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-white/40 hover:text-blue-500 mb-3 font-mono text-sm uppercase tracking-wider transition-colors"
                whileHover={{ x: -4 }}
              >
                <ArrowLeft className="w-4 h-4" />
                BACK TO CONTROL CENTER
              </motion.button>
              <h1
                ref={titleRef}
                className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tight"
              >
                NEW
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-blue-500 to-green-500">
                  CONNECTION
                </span>
              </h1>
            </div>

            {/* 步骤指示器 */}
            <div className="hidden lg:flex items-center gap-2">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <motion.div
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 border font-mono text-xs uppercase',
                      step >= s.id
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-white/10 text-white/30'
                    )}
                    animate={step === s.id ? { boxShadow: '0 0 15px rgba(59,130,246,0.3)' } : {}}
                  >
                    <span className="font-bold">{String(s.id).padStart(2, '0')}</span>
                    <span>{s.label}</span>
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-white/20" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* 主内容区 - 分左右两栏 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 左侧 - 数据库类型选择（始终可见） */}
          <div className="lg:col-span-4">
            <FloatingCard3D borderStyle="brutal" depth={8} className="h-full">
              <div className="p-4 border-b border-white/10">
                <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  DATABASE ENGINE
                </h2>
              </div>
              <div className="p-3 grid grid-cols-2 gap-2 max-h-[500px] overflow-auto">
                {DB_TYPES.map((type) => (
                  <motion.button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={cn(
                      'relative p-3 text-left transition-all border',
                      formData.db_type === type.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-white/10 bg-black/30 hover:border-white/30'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                    }}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="font-mono font-bold text-sm text-white">{type.label}</div>
                    <div className="text-[10px] text-white/40 font-mono">{type.desc}</div>
                    {type.defaultPort && (
                      <div className="text-[10px] font-mono mt-1" style={{ color: type.color }}>
                        :{type.defaultPort}
                      </div>
                    )}
                    {formData.db_type === type.value && (
                      <motion.div
                        className="absolute top-1 right-1 w-2 h-2 bg-blue-500"
                        layoutId="dbSelector"
                        animate={{ boxShadow: '0 0 8px rgba(59,130,246,0.6)' }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </FloatingCard3D>
          </div>

          {/* 右侧 - 表单区域 */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {step <= 2 ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <FloatingCard3D borderStyle="neon" depth={6}>
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                      <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-violet-500" />
                        CONNECTION CONFIG
                      </h2>
                      <div className="flex items-center gap-2 text-xs font-mono text-white/40">
                        <span className="text-lg">{selectedType?.icon}</span>
                        <span style={{ color: selectedType?.color }}>{selectedType?.label}</span>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* 连接名称 */}
                      <div>
                        <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                          <Server className="w-3 h-3" /> CONNECTION NAME
                          <span className="text-pink-500">*</span>
                        </label>
                        <TerminalField
                          value={formData.name}
                          onChange={(v) => setFormData({ ...formData, name: v })}
                          placeholder="production-mysql-01"
                        />
                      </div>

                      {isFileBasedDb ? (
                        <div>
                          <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                            <HardDrive className="w-3 h-3" /> FILE PATH
                            <span className="text-pink-500">*</span>
                          </label>
                          <TerminalField
                            value={formData.file_path || ''}
                            onChange={(v) => setFormData({ ...formData, file_path: v })}
                            placeholder="/data/app.db"
                          />
                        </div>
                      ) : (
                        <>
                          {/* 主机和端口 */}
                          <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                              <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                                <Globe className="w-3 h-3" /> HOST
                                <span className="text-pink-500">*</span>
                              </label>
                              <TerminalField
                                value={formData.host || ''}
                                onChange={(v) => setFormData({ ...formData, host: v })}
                                placeholder="localhost"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                                <Wifi className="w-3 h-3" /> PORT
                              </label>
                              <TerminalField
                                value={String(formData.port || '')}
                                onChange={(v) => setFormData({ ...formData, port: parseInt(v) || 0 })}
                                placeholder={String(selectedType?.defaultPort || 3306)}
                                type="number"
                              />
                            </div>
                          </div>

                          {/* 用户名和密码 */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                                <User className="w-3 h-3" /> USERNAME
                              </label>
                              <TerminalField
                                value={formData.username || ''}
                                onChange={(v) => setFormData({ ...formData, username: v })}
                                placeholder="root"
                              />
                            </div>
                            <div>
                              <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                                <Lock className="w-3 h-3" /> PASSWORD
                              </label>
                              <TerminalField
                                value={formData.password || ''}
                                onChange={(v) => setFormData({ ...formData, password: v })}
                                placeholder="••••••••"
                                type="password"
                              />
                            </div>
                          </div>

                          {/* 数据库名 */}
                          <div>
                            <label className="flex items-center gap-2 text-xs font-mono text-white/50 uppercase tracking-wider mb-2">
                              <Database className="w-3 h-3" /> DATABASE NAME
                            </label>
                            <TerminalField
                              value={formData.database || ''}
                              onChange={(v) => setFormData({ ...formData, database: v })}
                              placeholder="my_database"
                            />
                          </div>
                        </>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <BrutalButton variant="ghost" onClick={() => navigate('/dashboard')}>
                          CANCEL
                        </BrutalButton>
                        <BrutalButton
                          variant="primary"
                          onClick={handleCreate}
                          disabled={loading || !canProceedStep2}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              CREATING...
                            </>
                          ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" />
                              SAVE &amp; TEST
                            </>
                          )}
                        </BrutalButton>
                      </div>
                    </div>
                  </FloatingCard3D>

                  {/* 右侧下方 - 预览信息 */}
                  <motion.div
                    className="mt-6 grid grid-cols-3 gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <DataPanel
                      label="ENGINE"
                      value={selectedType?.label || '—'}
                      color={selectedType?.color || '#3b82f6'}
                    />
                    <DataPanel
                      label="PROTOCOL"
                      value={isFileBasedDb ? 'FILE' : 'TCP/IP'}
                      color="#8b5cf6"
                    />
                    <DataPanel
                      label="PORT"
                      value={isFileBasedDb ? '—' : String(formData.port || '—')}
                      color="#22c55e"
                    />
                  </motion.div>
                </motion.div>
              ) : (
                /* Step 3 - 验证结果 */
                <motion.div
                  key="verify"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                >
                  <FloatingCard3D borderStyle="neon" depth={6}>
                    <div className="p-4 border-b border-white/10">
                      <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-500" />
                        CONNECTION VERIFICATION
                      </h2>
                    </div>

                    <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
                      {/* 连接信息摘要 */}
                      <div className="w-full max-w-md mb-8">
                        <div className="grid grid-cols-2 gap-3 text-sm font-mono">
                          <div className="p-3 bg-black/40 border border-white/10">
                            <div className="text-[10px] text-white/40 mb-1">NAME</div>
                            <div className="text-white">{formData.name}</div>
                          </div>
                          <div className="p-3 bg-black/40 border border-white/10">
                            <div className="text-[10px] text-white/40 mb-1">TYPE</div>
                            <div style={{ color: selectedType?.color }}>{selectedType?.label}</div>
                          </div>
                          <div className="p-3 bg-black/40 border border-white/10">
                            <div className="text-[10px] text-white/40 mb-1">HOST</div>
                            <div className="text-white">{formData.host || formData.file_path || '—'}</div>
                          </div>
                          <div className="p-3 bg-black/40 border border-white/10">
                            <div className="text-[10px] text-white/40 mb-1">STATUS</div>
                            <div className={cn(
                              testStatus === 'success' && 'text-green-500',
                              testStatus === 'error' && 'text-red-500',
                              testStatus === 'testing' && 'text-blue-500',
                              testStatus === 'idle' && 'text-white/50',
                            )}>
                              {testStatus === 'success' && 'CONNECTED'}
                              {testStatus === 'error' && 'FAILED'}
                              {testStatus === 'testing' && 'TESTING...'}
                              {testStatus === 'idle' && 'UNTESTED'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 状态图标 */}
                      <AnimatePresence mode="wait">
                        {testStatus === 'idle' && (
                          <motion.div
                            key="idle"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="mb-6"
                          >
                            <div className="w-20 h-20 border-2 border-dashed border-white/20 flex items-center justify-center">
                              <Wifi className="w-8 h-8 text-white/30" />
                            </div>
                          </motion.div>
                        )}
                        {testStatus === 'testing' && (
                          <motion.div
                            key="testing"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="mb-6"
                          >
                            <motion.div
                              className="w-20 h-20 border-2 border-blue-500 flex items-center justify-center"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            >
                              <Loader2 className="w-8 h-8 text-blue-500" />
                            </motion.div>
                          </motion.div>
                        )}
                        {testStatus === 'success' && (
                          <motion.div
                            key="success"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="mb-6"
                          >
                            <div className="w-20 h-20 border-2 border-green-500 bg-green-500/10 flex items-center justify-center">
                              <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                          </motion.div>
                        )}
                        {testStatus === 'error' && (
                          <motion.div
                            key="error"
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            className="mb-6"
                          >
                            <div className="w-20 h-20 border-2 border-red-500 bg-red-500/10 flex items-center justify-center">
                              <AlertTriangle className="w-10 h-10 text-red-500" />
                            </div>
                            <p className="text-xs text-red-500 font-mono mt-3 max-w-sm text-center break-all">
                              {testError}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 操作按钮 */}
                      <div className="flex gap-3 mt-4">
                        <BrutalButton variant="ghost" onClick={handleTest}>
                          <Wifi className="w-4 h-4 mr-2" />
                          {testStatus === 'idle' ? 'RUN TEST' : 'RETRY TEST'}
                        </BrutalButton>
                        <BrutalButton variant="primary" onClick={() => navigate('/dashboard')}>
                          <ChevronRight className="w-4 h-4 mr-2" />
                          GO TO DASHBOARD
                        </BrutalButton>
                      </div>
                    </div>
                  </FloatingCard3D>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

// 终端风格输入框
function TerminalField({
  value, onChange, placeholder, type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-3 font-mono focus-within:border-blue-500/50 transition-colors">
      <span className="text-blue-500 text-sm">{'>'}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white outline-none placeholder-white/20 text-sm"
      />
      <motion.span
        className="w-1.5 h-4 bg-blue-500/60"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </div>
  );
}
