// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { healthCheck, HealthResponse } from '../service/api';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchHealth = async () => {
    try {
      const res = await healthCheck();
      setHealth(res.data);
    } catch (err: any) { // ← 显式标注 any（调试用）
      console.error('健康检查失败:', err.message || err);
      // 👆 关键：打印 err.message
    } finally {
      setLoading(false);
    }
  };
  fetchHealth();
}, []);

  if (loading) return <div>加载中...</div>;

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">后端状态</h2>
      {health && (
        <div className="space-y-2">
          <p>✅ 状态: {health.status}</p>
          <p>📦 版本: {health.version}</p>
          <p>⏱️ 时间: {new Date(health.timestamp).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}