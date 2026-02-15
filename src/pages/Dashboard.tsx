import { useState, useEffect } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faServer, 
  faCheckCircle, 
  faTimesCircle,
  faSpinner,
  faPlay,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { ConnectionList } from '../components/connections/ConnectionList';
import { ConnectionDialog } from '../components/connections/ConnectionDialog';
import { useResponsive } from '../hooks/useResponsive';
import { 
  getConnection, 
  testConnection, 
  deleteConnection,
  getAggregatedHealth 
} from '../api/modules/connections';
import type { ConnectionItem, AggregatedHealth, ConnectionTestResult } from '../types/connection';
import { toast } from 'react-toastify';

export function Dashboard() {
  const { id } = useParams<{ id?: string }>();
  const { isMobile } = useResponsive();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionItem | null>(null);
  const [healthData, setHealthData] = useState<AggregatedHealth | null>(null);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 加载选中的连接详情
  useEffect(() => {
    if (id) {
      loadConnectionDetail(id);
    } else {
      setSelectedConnection(null);
    }
  }, [id]);

  // 加载健康状态
  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // 每30秒刷新
    return () => clearInterval(interval);
  }, []);

  const loadConnectionDetail = async (connId: string) => {
    try {
      const response = await getConnection(connId);
      setSelectedConnection(response.data);
    } catch (error) {
      console.error('Failed to load connection:', error);
    }
  };

  const loadHealth = async () => {
    try {
      const response = await getAggregatedHealth();
      setHealthData(response.data);
    } catch (error) {
      console.error('Failed to load health:', error);
    }
  };

  // 测试连接
  const handleTest = async () => {
    if (!selectedConnection) return;
    
    setTesting(true);
    setTestResult(null);
    try {
      const response = await testConnection(selectedConnection.id);
      setTestResult(response.data);
      if (response.data.success) {
        toast.success(`连接测试成功 (${response.data.latency_ms}ms)`);
      } else {
        toast.error(`连接测试失败: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Failed to test connection:', error);
    } finally {
      setTesting(false);
    }
  };

  // 删除连接
  const handleDelete = async () => {
    if (!selectedConnection) return;
    
    if (!window.confirm(`确定要删除连接 "${selectedConnection.name}" 吗？`)) {
      return;
    }

    setDeleting(true);
    try {
      await deleteConnection(selectedConnection.id);
      toast.success('连接已删除');
      setSelectedConnection(null);
      // 刷新列表会由 ConnectionList 组件处理
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to delete connection:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container-fluid" style={{ width: '98%' }}>
      <div className="row">
        {/* 左侧连接列表 (桌面端显示) */}
        {!isMobile && (
          <div className="col-12 col-md-5 col-xl-4 ps-0">
            <ConnectionList 
              scrollbar={true} 
              activeId={id}
            />
          </div>
        )}

        {/* 右侧内容区域 */}
        <div className="col-12 col-md-7 col-xl-8 mb-3 gx-0">
          {selectedConnection ? (
            // 连接详情
            <div className="shadow-box big-padding">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>{selectedConnection.name}</h2>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={handleTest}
                    disabled={testing}
                  >
                    {testing ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                    ) : (
                      <FontAwesomeIcon icon={faPlay} className="me-1" />
                    )}
                    测试连接
                  </button>
                  <button 
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    {deleting ? (
                      <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                    ) : (
                      <FontAwesomeIcon icon={faTrash} className="me-1" />
                    )}
                    删除
                  </button>
                </div>
              </div>

              {/* 连接信息 */}
              <div className="row mb-4">
                <div className="col-md-6">
                  <table className="table">
                    <tbody>
                      <tr>
                        <td className="text-muted">类型</td>
                        <td><strong>{selectedConnection.db_type.toUpperCase()}</strong></td>
                      </tr>
                      <tr>
                        <td className="text-muted">主机</td>
                        <td>{selectedConnection.host || '-'}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">端口</td>
                        <td>{selectedConnection.port || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="col-md-6">
                  <table className="table">
                    <tbody>
                      <tr>
                        <td className="text-muted">用户名</td>
                        <td>{selectedConnection.username || '-'}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">数据库</td>
                        <td>{selectedConnection.database || '-'}</td>
                      </tr>
                      <tr>
                        <td className="text-muted">创建时间</td>
                        <td>{selectedConnection.created_at}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 测试结果 */}
              {testResult && (
                <div className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'}`}>
                  <FontAwesomeIcon 
                    icon={testResult.success ? faCheckCircle : faTimesCircle} 
                    className="me-2"
                  />
                  {testResult.success 
                    ? `连接成功，延迟 ${testResult.latency_ms}ms`
                    : `连接失败: ${testResult.error}`
                  }
                </div>
              )}
            </div>
          ) : (
            // 欢迎页面 / 仪表盘
            <div className="shadow-box big-padding">
              <h2 className="mb-4">数据库管理仪表盘</h2>

              {/* 服务状态 */}
              {healthData && (
                <div className="mb-4">
                  <h5 className="settings-subheading">服务状态</h5>
                  <div className="row mt-3">
                    {healthData.services.map((service) => (
                      <div key={service.name} className="col-md-4 mb-3">
                        <div className={`shadow-box ${service.healthy ? '' : 'border border-danger'}`}>
                          <div className="d-flex align-items-center">
                            <span 
                              className={`status-dot ${service.healthy ? 'healthy' : 'unhealthy'}`}
                            />
                            <div>
                              <strong>{service.name}</strong>
                              <div className="small text-muted">
                                {service.healthy ? '运行正常' : service.error || '服务异常'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 快速操作 */}
              <div>
                <h5 className="settings-subheading">快速操作</h5>
                <div className="mt-3">
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => setDialogOpen(true)}
                  >
                    <FontAwesomeIcon icon={faPlus} className="me-2" />
                    添加数据库连接
                  </button>
                </div>
              </div>

              {/* 使用提示 */}
              <div className="mt-4 p-3 bg-light rounded">
                <h6>使用说明</h6>
                <ul className="mb-0 small">
                  <li>点击左侧列表中的连接查看详情</li>
                  <li>使用"测试连接"检查数据库是否可访问</li>
                  <li>支持 MySQL、PostgreSQL、SQLite、Redis、MongoDB 等多种数据库</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加连接对话框 */}
      <ConnectionDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </div>
  );
}
