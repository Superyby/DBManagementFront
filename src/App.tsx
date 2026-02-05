import React, { useState, useEffect } from 'react';
import './App.css';
import { healthCheck, HealthResponse } from './service/api';

function App() {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthCheck();
      setHealthData(response.data);
    } catch (err: any) {
      setError(err.message || '健康检查失败');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>数据库管理器</h1>
        <button onClick={checkHealth} disabled={loading}>
          {loading ? '检查中...' : '检查健康状态'}
        </button>

        {error && (
          <div style={{ color: 'red', marginTop: '20px' }}>
            错误: {error}
          </div>
        )}

        {healthData && (
          <div style={{ marginTop: '20px', textAlign: 'left', maxWidth: '400px' }}>
            <h3>健康检查结果:</h3>
            <p><strong>状态:</strong> {healthData.status}</p>
            <p><strong>版本:</strong> {healthData.version}</p>
            <p><strong>时间戳:</strong> {healthData.timestamp}</p>
          </div>
        )}

        <div style={{ marginTop: '30px', fontSize: '14px', opacity: 0.8 }}>
          <p>API 地址: http://192.168.31.36:8080</p>
          <p>代理测试: http://192.168.31.36:3000/api/health</p>
        </div>
        <h1>Hedy Lamarr's Todos</h1>
        <img
          src="https://i.imgur.com/yXOvdOSs.jpg"
          alt="Hedy Lamarr"
          className="photo"
        />
        <ul>
          <li>Invent new traffic lights</li>
          <li>Rehearse a movie scene</li>
          <li>Improve the spectrum technology</li>
        </ul>
      </header>
    </div>
  );
}

export default App;
