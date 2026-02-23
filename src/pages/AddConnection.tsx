import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Loader2, Database, Server, Zap,
  Globe, Lock, User, HardDrive, ChevronRight, CheckCircle2,
  AlertTriangle, Wifi,
} from 'lucide-react';
import { createConnection, testConnection as apiTestConnection } from '../api/modules/connections';
import type { CreateConnectionRequest, DbType } from '../types/connection';
import { useNotification } from '../components/effects/Notification';
import { Card, Button, DataPanel } from '../components/ui/BrutalComponents';
import { cn } from '../lib/utils';

const DB_TYPES: {
  value: DbType; label: string; defaultPort?: number; color: string; icon: string; desc: string;
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

const STEPS = [
  { id: 1, label: 'TYPE', desc: 'Select DB' },
  { id: 2, label: 'CONFIG', desc: 'Connection' },
  { id: 3, label: 'VERIFY', desc: 'Test' },
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
    name: '', db_type: 'mysql', host: 'localhost', port: 3306, username: '', password: '', database: '',
  });

  const isFileBasedDb = formData.db_type === 'sqlite';
  const selectedType = DB_TYPES.find((t) => t.value === formData.db_type);

  const handleTypeChange = (type: DbType) => {
    const dbType = DB_TYPES.find((t) => t.value === type);
    setFormData((prev) => ({
      ...prev, db_type: type, port: dbType?.defaultPort || prev.port,
      file_path: type === 'sqlite' ? prev.file_path || '' : undefined,
    }));
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const result = await createConnection(formData);
      setCreatedId(result.data?.id || null);
      success('Connection Saved', `${formData.name} has been registered`);
      setStep(3);
    } catch (err: any) {
      notifyError('Create Failed', err?.parsedMessage || err?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    if (!createdId) return;
    setTestStatus('testing');
    setTestError('');
    try {
      const result = await apiTestConnection(createdId);
      if (result.data?.success) {
        setTestStatus('success');
        success('Connection OK', `Latency: ${result.data.latency_ms}ms`);
      } else {
        setTestStatus('error');
        setTestError(result.data?.error || 'Connection failed');
        notifyError('Test Failed', result.data?.error || 'Unable to reach database');
      }
    } catch (err: any) {
      setTestStatus('error');
      const msg = err?.parsedMessage || err?.message || 'Test failed';
      setTestError(msg);
      notifyError('Test Error', msg);
    }
  };

  const canProceedStep2 = formData.name.trim() !== '' && (
    isFileBasedDb ? (formData.file_path || '').trim() !== '' : (formData.host || '').trim() !== ''
  );

  return (
    <div>
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-[var(--text-m)] hover:text-[var(--text)] text-sm transition-colors"
            whileHover={{ x: -2 }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </motion.button>
          <div className="w-px h-5 bg-[var(--border)]" />
          <h1 className="text-xl font-semibold text-[var(--text)]">New Connection</h1>
        </div>
      </header>

      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 border text-xs rounded-md',
              step >= s.id
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)]'
                : 'border-[var(--border)] text-[var(--text-m)]'
            )}>
              <span className="font-semibold">{String(s.id).padStart(2, '0')}</span>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-m)]" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <Card className="h-full">
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Database className="w-4 h-4 text-[var(--text-s)]" /> Database Engine
              </h2>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2 max-h-[500px] overflow-auto">
              {DB_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value)}
                  className={cn(
                    'relative p-3 text-left transition-all border rounded-md',
                    formData.db_type === type.value
                      ? 'border-[var(--accent)] bg-[var(--bg-t)]'
                      : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--bg-s)]'
                  )}
                >
                  <div className="text-lg mb-1">{type.icon}</div>
                  <div className="text-sm font-medium text-[var(--text)]">{type.label}</div>
                  <div className="text-[10px] text-[var(--text-m)]">{type.desc}</div>
                  {type.defaultPort && (
                    <div className="text-[10px] mt-1" style={{ color: type.color }}>:{type.defaultPort}</div>
                  )}
                  {formData.db_type === type.value && (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--accent)]" />
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step <= 2 ? (
              <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card>
                  <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[var(--text-s)]" /> Connection Config
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-m)]">
                      <span className="text-lg">{selectedType?.icon}</span>
                      <span style={{ color: selectedType?.color }}>{selectedType?.label}</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="flex items-center gap-1.5 text-xs text-[var(--text-s)] mb-1.5">
                        <Server className="w-3 h-3" /> Connection Name <span className="text-red-500">*</span>
                      </label>
                      <InputField value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} placeholder="production-mysql-01" />
                    </div>
                    {isFileBasedDb ? (
                      <div>
                        <label className="flex items-center gap-1.5 text-xs text-[var(--text-s)] mb-1.5">
                          <HardDrive className="w-3 h-3" /> File Path <span className="text-red-500">*</span>
                        </label>
                        <InputField value={formData.file_path || ''} onChange={(v) => setFormData({ ...formData, file_path: v })} placeholder="/data/app.db" />
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="col-span-2">
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text-s)] mb-1.5">
                              <Globe className="w-3 h-3" /> Host <span className="text-red-500">*</span>
                            </label>
                            <InputField value={formData.host || ''} onChange={(v) => setFormData({ ...formData, host: v })} placeholder="localhost" />
                          </div>
                          <div>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text-s)] mb-1.5">
                              <Wifi className="w-3 h-3" /> Port
                            </label>
                            <InputField value={String(formData.port || '')} onChange={(v) => setFormData({ ...formData, port: parseInt(v) || 0 })} placeholder={String(selectedType?.defaultPort || 3306)} type="number" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text-s)] mb-1.5">
                              <User className="w-3 h-3" /> Username
                            </label>
                            <InputField value={formData.username || ''} onChange={(v) => setFormData({ ...formData, username: v })} placeholder="root" />
                          </div>
                          <div>
                            <label className="flex items-center gap-1.5 text-xs text-[var(--text-s)] mb-1.5">
                              <Lock className="w-3 h-3" /> Password
                            </label>
                            <InputField value={formData.password || ''} onChange={(v) => setFormData({ ...formData, password: v })} placeholder="••••••••" type="password" />
                          </div>
                        </div>
                        <div>
                          <label className="flex items-center gap-1.5 text-xs text-[var(--text-s)] mb-1.5">
                            <Database className="w-3 h-3" /> Database Name
                          </label>
                          <InputField value={formData.database || ''} onChange={(v) => setFormData({ ...formData, database: v })} placeholder="my_database" />
                        </div>
                      </>
                    )}
                    <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
                      <Button variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
                      <Button variant="primary" onClick={handleCreate} disabled={loading || !canProceedStep2}>
                        {loading ? (<><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...</>) : (<><Save className="w-4 h-4 mr-2" /> Save & Test</>)}
                      </Button>
                    </div>
                  </div>
                </Card>

                <div className="mt-5 grid grid-cols-3 gap-4">
                  <DataPanel label="ENGINE" value={selectedType?.label || '—'} color={selectedType?.color} />
                  <DataPanel label="PROTOCOL" value={isFileBasedDb ? 'FILE' : 'TCP/IP'} />
                  <DataPanel label="PORT" value={isFileBasedDb ? '—' : String(formData.port || '—')} />
                </div>
              </motion.div>
            ) : (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <Card>
                  <div className="px-4 py-3 border-b border-[var(--border)]">
                    <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-green-500" /> Connection Verification
                    </h2>
                  </div>
                  <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="w-full max-w-md mb-8">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          { label: 'NAME', value: formData.name },
                          { label: 'TYPE', value: selectedType?.label, color: selectedType?.color },
                          { label: 'HOST', value: formData.host || formData.file_path || '—' },
                          { label: 'STATUS', value: testStatus === 'success' ? 'CONNECTED' : testStatus === 'error' ? 'FAILED' : testStatus === 'testing' ? 'TESTING...' : 'UNTESTED',
                            color: testStatus === 'success' ? '#22c55e' : testStatus === 'error' ? '#ef4444' : testStatus === 'testing' ? '#3b82f6' : undefined },
                        ].map((item) => (
                          <div key={item.label} className="p-3 bg-[var(--bg-s)] border border-[var(--border)] rounded-md">
                            <div className="text-[10px] text-[var(--text-m)] mb-1">{item.label}</div>
                            <div className="text-[var(--text)]" style={item.color ? { color: item.color } : undefined}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {testStatus === 'idle' && (
                        <motion.div key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="mb-6">
                          <div className="w-16 h-16 border-2 border-dashed border-[var(--border)] rounded-lg flex items-center justify-center">
                            <Wifi className="w-7 h-7 text-[var(--text-m)]" />
                          </div>
                        </motion.div>
                      )}
                      {testStatus === 'testing' && (
                        <motion.div key="testing" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="mb-6">
                          <motion.div className="w-16 h-16 border-2 border-blue-500 rounded-lg flex items-center justify-center" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                            <Loader2 className="w-7 h-7 text-blue-500" />
                          </motion.div>
                        </motion.div>
                      )}
                      {testStatus === 'success' && (
                        <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="mb-6">
                          <div className="w-16 h-16 border-2 border-green-500 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          </div>
                        </motion.div>
                      )}
                      {testStatus === 'error' && (
                        <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="mb-6">
                          <div className="w-16 h-16 border-2 border-red-500 bg-red-500/10 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-red-500" />
                          </div>
                          <p className="text-xs text-red-500 mt-3 max-w-sm text-center break-all">{testError}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-3 mt-4">
                      <Button variant="ghost" onClick={handleTest}>
                        <Wifi className="w-4 h-4 mr-2" /> {testStatus === 'idle' ? 'Run Test' : 'Retry Test'}
                      </Button>
                      <Button variant="primary" onClick={() => navigate('/dashboard')}>
                        <ChevronRight className="w-4 h-4 mr-2" /> Go to Dashboard
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function InputField({
  value, onChange, placeholder, type = 'text',
}: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--text)] outline-none placeholder-[var(--text-m)] focus:border-[var(--border-hover)] transition-colors"
    />
  );
}
