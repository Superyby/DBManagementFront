import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { createConnection } from '../../api/modules/connections';
import type { CreateConnectionRequest, DbType, DB_TYPES } from '../../types/connection';
import { toast } from 'react-toastify';

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

const initialFormData: CreateConnectionRequest = {
  name: '',
  db_type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: '',
  password: '',
  database: '',
};

export function ConnectionDialog({ isOpen, onClose, onSuccess }: ConnectionDialogProps) {
  const [formData, setFormData] = useState<CreateConnectionRequest>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
      setErrors({});
    }
  }, [isOpen]);

  // 数据库类型变更时更新默认端口
  const handleDbTypeChange = (dbType: DbType) => {
    const option = DB_TYPE_OPTIONS.find(opt => opt.value === dbType);
    setFormData(prev => ({
      ...prev,
      db_type: dbType,
      port: option?.defaultPort,
      host: dbType === 'sqlite' ? undefined : prev.host || 'localhost',
      file_path: dbType === 'sqlite' ? '' : undefined,
    }));
  };

  // 表单字段变更
  const handleChange = (field: keyof CreateConnectionRequest, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 表单验证
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入连接名称';
    }

    if (formData.db_type === 'sqlite') {
      if (!formData.file_path?.trim()) {
        newErrors.file_path = '请输入数据库文件路径';
      }
    } else {
      if (!formData.host?.trim()) {
        newErrors.host = '请输入主机地址';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await createConnection(formData);
      toast.success('连接创建成功');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to create connection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const isSqlite = formData.db_type === 'sqlite';

  return (
    <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">添加数据库连接</h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* 连接名称 */}
              <div className="mb-3">
                <label className="form-label">连接名称 *</label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="例如: 生产数据库"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              </div>

              {/* 数据库类型 */}
              <div className="mb-3">
                <label className="form-label">数据库类型 *</label>
                <select
                  className="form-select"
                  value={formData.db_type}
                  onChange={(e) => handleDbTypeChange(e.target.value as DbType)}
                >
                  {DB_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* SQLite 文件路径 */}
              {isSqlite ? (
                <div className="mb-3">
                  <label className="form-label">数据库文件路径 *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.file_path ? 'is-invalid' : ''}`}
                    value={formData.file_path || ''}
                    onChange={(e) => handleChange('file_path', e.target.value)}
                    placeholder="例如: /path/to/database.db"
                  />
                  {errors.file_path && <div className="invalid-feedback">{errors.file_path}</div>}
                </div>
              ) : (
                <>
                  {/* 主机和端口 */}
                  <div className="row mb-3">
                    <div className="col-md-8">
                      <label className="form-label">主机地址 *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.host ? 'is-invalid' : ''}`}
                        value={formData.host || ''}
                        onChange={(e) => handleChange('host', e.target.value)}
                        placeholder="localhost"
                      />
                      {errors.host && <div className="invalid-feedback">{errors.host}</div>}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">端口</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.port || ''}
                        onChange={(e) => handleChange('port', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  {/* 用户名和密码 */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">用户名</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.username || ''}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="root"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">密码</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password || ''}
                        onChange={(e) => handleChange('password', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* 数据库名称 */}
                  <div className="mb-3">
                    <label className="form-label">数据库名称</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.database || ''}
                      onChange={(e) => handleChange('database', e.target.value)}
                      placeholder="默认数据库"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onClose}
                disabled={loading}
              >
                <FontAwesomeIcon icon={faTimes} className="me-1" />
                取消
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                ) : (
                  <FontAwesomeIcon icon={faSave} className="me-1" />
                )}
                保存
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
