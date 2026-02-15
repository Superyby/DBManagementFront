import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { createConnection } from '../../api/modules/connections';
import type { CreateConnectionRequest, DbType } from '../../types/connection';
import { useNotification } from '../effects/Notification';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface ConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// 支持的数据库类型列表
const DB_TYPE_OPTIONS: { value: DbType; label: string; defaultPort?: number }[] = [
  { value: 'mysql', label: 'MySQL', defaultPort: 3306 },
  { value: 'postgres', label: 'PostgreSQL', defaultPort: 5432 },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'redis', label: 'Redis', defaultPort: 6379 },
  { value: 'mongodb', label: 'MongoDB', defaultPort: 27017 },
  { value: 'mariadb', label: 'MariaDB', defaultPort: 3306 },
  { value: 'sqlserver', label: 'SQL Server', defaultPort: 1433 },
  { value: 'oracle', label: 'Oracle', defaultPort: 1521 },
  { value: 'clickhouse', label: 'ClickHouse', defaultPort: 8123 },
  { value: 'elasticsearch', label: 'Elasticsearch', defaultPort: 9200 },
];

export function ConnectionDialog({ isOpen, onClose, onSuccess }: ConnectionDialogProps) {
  const { success, error } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateConnectionRequest>({
    name: '',
    db_type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: '',
    password: '',
    database: '',
  });

  // 当数据库类型改变时，更新默认端口
  useEffect(() => {
    const dbType = DB_TYPE_OPTIONS.find((t) => t.value === formData.db_type);
    if (dbType?.defaultPort && formData.port !== dbType.defaultPort) {
      setFormData((prev) => ({ ...prev, port: dbType.defaultPort }));
    }
  }, [formData.db_type]);

  const isFileBasedDb = formData.db_type === 'sqlite';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createConnection(formData);
      success('创建成功', '连接已添加');
      onSuccess?.();
      onClose();
      // 重置表单
      setFormData({
        name: '',
        db_type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: '',
        password: '',
        database: '',
      });
    } catch {
      error('创建失败', '无法创建连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 对话框 */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={cn(
                'w-full max-w-lg',
                'bg-cyber-surface border border-cyber-border rounded-xl',
                'shadow-[0_0_50px_rgba(0,255,242,0.1)]'
              )}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 头部 */}
              <div className="flex items-center justify-between p-4 border-b border-cyber-border">
                <h2 className="text-lg font-semibold text-cyber-text">添加数据库连接</h2>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 表单 */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* 连接名称 */}
                <div>
                  <label className="block text-sm text-cyber-muted mb-1.5">连接名称</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="我的数据库连接"
                    required
                  />
                </div>

                {/* 数据库类型 */}
                <div>
                  <label className="block text-sm text-cyber-muted mb-1.5">数据库类型</label>
                  <select
                    value={formData.db_type}
                    onChange={(e) => setFormData({ ...formData, db_type: e.target.value as DbType })}
                    className={cn(
                      'w-full px-3 py-2 rounded-lg',
                      'bg-cyber-bg border border-cyber-border',
                      'text-cyber-text focus:border-cyber-cyan focus:outline-none',
                      'transition-colors'
                    )}
                  >
                    {DB_TYPE_OPTIONS.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 文件路径（SQLite） */}
                {isFileBasedDb ? (
                  <div>
                    <label className="block text-sm text-cyber-muted mb-1.5">文件路径</label>
                    <Input
                      value={formData.file_path || ''}
                      onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                      placeholder="/path/to/database.db"
                      required
                    />
                  </div>
                ) : (
                  <>
                    {/* 主机和端口 */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-sm text-cyber-muted mb-1.5">主机</label>
                        <Input
                          value={formData.host || ''}
                          onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                          placeholder="localhost"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-cyber-muted mb-1.5">端口</label>
                        <Input
                          type="number"
                          value={formData.port || ''}
                          onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
                          placeholder="3306"
                          required
                        />
                      </div>
                    </div>

                    {/* 用户名和密码 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-cyber-muted mb-1.5">用户名</label>
                        <Input
                          value={formData.username || ''}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          placeholder="root"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-cyber-muted mb-1.5">密码</label>
                        <Input
                          type="password"
                          value={formData.password || ''}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    {/* 数据库名 */}
                    <div>
                      <label className="block text-sm text-cyber-muted mb-1.5">数据库名</label>
                      <Input
                        value={formData.database || ''}
                        onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                        placeholder="my_database"
                      />
                    </div>
                  </>
                )}

                {/* 按钮 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-cyber-border">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    取消
                  </Button>
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        创建中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        创建连接
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
