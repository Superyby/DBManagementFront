## 1. 项目目录结构
```text
src/
├── pages/
│   ├── Dashboard.tsx          ← 概览页
│   └── ConnectionsPage.tsx    ← 连接管理主页面
├── components/
│   ├── ConnectionForm.tsx     ← 新建/编辑连接表单
│   ├── ConnectionCard.tsx     ← 单个连接展示卡片
│   └── StatusBadge.tsx        ← 连接状态标签（绿色/红色）
├── services/
│   ├── api.ts                 ← axios 实例
│   └── connectionApi.ts       ← 封装连接相关 API
├── types/
│   └── index.ts               ← ConnectionConfig, DbType 等 TS 类型
├── hooks/
│   └── useConnections.ts      ← 自定义 Hook 管理连接列表
└── App.tsx
```