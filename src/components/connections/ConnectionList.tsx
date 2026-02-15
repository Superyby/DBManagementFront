import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import { ConnectionItem } from './ConnectionItem';
import { getConnections, testConnection } from '../../api/modules/connections';
import type { ConnectionItem as ConnectionItemType, ConnectionTestResult } from '../../types/connection';
import { toast } from 'react-toastify';

interface ConnectionListProps {
  scrollbar?: boolean;
  activeId?: string;
  onSelect?: (connection: ConnectionItemType) => void;
}

export function ConnectionList({ 
  scrollbar = true, 
  activeId,
  onSelect,
}: ConnectionListProps) {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ConnectionItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [testStatuses, setTestStatuses] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({});

  // 加载连接列表
  const loadConnections = async () => {
    setLoading(true);
    try {
      const response = await getConnections();
      setConnections(response.data || []);
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  // 测试连接
  const handleTestConnection = async (id: string) => {
    setTestStatuses(prev => ({ ...prev, [id]: 'testing' }));
    try {
      const response = await testConnection(id);
      const result = response.data;
      if (result.success) {
        setTestStatuses(prev => ({ ...prev, [id]: 'success' }));
        toast.success(`连接测试成功 (${result.latency_ms}ms)`);
      } else {
        setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
        toast.error(`连接测试失败: ${result.error}`);
      }
    } catch (error) {
      setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
    }
  };

  // 点击连接
  const handleClick = (connection: ConnectionItemType) => {
    if (onSelect) {
      onSelect(connection);
    } else {
      navigate(`/dashboard/${connection.id}`);
    }
  };

  return (
    <div className={`connection-list ${scrollbar ? 'scrollbar' : ''}`}>
      {/* 操作栏 */}
      <div className="d-flex mb-3 gap-2">
        <button 
          className="btn btn-primary flex-grow-1"
          onClick={() => navigate('/add')}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          添加连接
        </button>
        <button 
          className="btn btn-outline-secondary"
          onClick={loadConnections}
          disabled={loading}
        >
          <FontAwesomeIcon icon={faSync} spin={loading} />
        </button>
      </div>

      {/* 连接列表 */}
      {loading && connections.length === 0 ? (
        <div className="text-center text-muted py-4">
          加载中...
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center text-muted py-4">
          <p>暂无连接</p>
          <p className="small">点击上方按钮添加第一个数据库连接</p>
        </div>
      ) : (
        connections.map((connection) => (
          <ConnectionItem
            key={connection.id}
            connection={connection}
            isActive={connection.id === activeId}
            onClick={() => handleClick(connection)}
            testStatus={testStatuses[connection.id] || 'idle'}
          />
        ))
      )}
    </div>
  );
}
