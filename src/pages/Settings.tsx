import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon, Sun, Info, Github, Heart, Zap, Server, Database,
  Cpu, Globe, Shield, Palette, ChevronRight,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { FloatingCard3D, BrutalButton, DataPanel } from '../components/ui/BrutalComponents';
import { cn } from '../lib/utils';

// 支持的数据库列表
const SUPPORTED_DBS = [
  { name: 'MySQL', color: '#00758f', icon: '🐬' },
  { name: 'PostgreSQL', color: '#336791', icon: '🐘' },
  { name: 'SQLite', color: '#003b57', icon: '📦' },
  { name: 'Redis', color: '#dc382d', icon: '⚡' },
  { name: 'MongoDB', color: '#47a248', icon: '🍃' },
  { name: 'MariaDB', color: '#003545', icon: '🔷' },
  { name: 'SQL Server', color: '#cc2927', icon: '🏢' },
  { name: 'Oracle', color: '#f80000', icon: '🔴' },
  { name: 'ClickHouse', color: '#ffcc01', icon: '🏠' },
  { name: 'Elasticsearch', color: '#005571', icon: '🔍' },
];

// 后端服务
const SERVICES = [
  { name: 'GATEWAY', port: 8080, color: '#3b82f6' },
  { name: 'CONNECTION', port: 8081, color: '#22c55e' },
  { name: 'QUERY', port: 8082, color: '#8b5cf6' },
  { name: 'AI SERVICE', port: 8083, color: '#ec4899' },
];

export function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState<string>('appearance');

  return (
    <div>
      {/* 头部 */}
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="text-xs text-zinc-500 mt-0.5">System configuration & information</p>
      </header>

      {/* 顶部状态面板 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataPanel label="VERSION" value="v1.0.0" color="#3b82f6" />
        <DataPanel label="THEME" value={isDark ? 'DARK' : 'LIGHT'} color="#8b5cf6" />
        <DataPanel label="DATABASES" value={SUPPORTED_DBS.length} color="#22c55e" />
        <DataPanel label="SERVICES" value={SERVICES.length} color="#ec4899" />
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 左侧 - 导航 */}
        <div className="lg:col-span-3">
          <FloatingCard3D borderStyle="brutal" depth={6}>
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <h2 className="text-sm font-medium text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-500" />
                Sections
              </h2>
            </div>
            <div className="p-2">
              {[
                { id: 'appearance', label: 'Appearance', icon: Palette },
                { id: 'services', label: 'Services', icon: Server },
                { id: 'databases', label: 'Databases', icon: Database },
                { id: 'about', label: 'About', icon: Info },
              ].map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md transition-all duration-150',
                      isActive
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.03]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[13px] font-medium">{section.label}</span>
                    <ChevronRight className={cn('w-3 h-3 ml-auto', isActive && 'text-blue-500')} />
                  </button>
                );
              })}
            </div>
          </FloatingCard3D>
        </div>

        {/* 右侧 - 内容区 */}
        <div className="lg:col-span-9">
          {/* APPEARANCE */}
          {activeSection === 'appearance' && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FloatingCard3D borderStyle="neon" depth={6}>
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <h2 className="text-sm font-medium text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-violet-500" />
                    Appearance
                  </h2>
                </div>
                <div className="p-5">
                  {/* 主题切换 */}
                  <div className="flex items-center justify-between p-4 bg-black/20 border border-zinc-800 rounded-md mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 flex items-center justify-center border rounded-md',
                        isDark ? 'border-violet-500/40 bg-violet-500/10' : 'border-blue-500/40 bg-blue-500/10'
                      )}>
                        {isDark ? <Moon className="w-5 h-5 text-violet-500" /> : <Sun className="w-5 h-5 text-blue-500" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Theme Mode</div>
                        <div className="text-xs text-zinc-500 mt-0.5">
                          Current: {isDark ? 'Dark Mode' : 'Light Mode'}
                        </div>
                      </div>
                    </div>
                    <BrutalButton variant="ghost" size="sm" onClick={toggleTheme}>
                      {isDark ? <Sun className="w-4 h-4 mr-1.5" /> : <Moon className="w-4 h-4 mr-1.5" />}
                      {isDark ? 'Light' : 'Dark'}
                    </BrutalButton>
                  </div>

                  {/* UI 风格信息 */}
                  <div className="flex items-center gap-3 p-4 bg-black/20 border border-zinc-800 rounded-md">
                    <div className="w-10 h-10 flex items-center justify-center border border-pink-500/40 bg-pink-500/10 rounded-md">
                      <Zap className="w-5 h-5 text-pink-500" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">UI Style</div>
                      <div className="text-xs text-blue-500 mt-0.5">Modern Minimal / Industrial Sci-Fi</div>
                    </div>
                  </div>
                </div>
              </FloatingCard3D>
            </motion.div>
          )}

          {/* SERVICES */}
          {activeSection === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FloatingCard3D borderStyle="neon" depth={6}>
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <h2 className="text-sm font-medium text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-500" />
                    Backend Services
                  </h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES.map((service, i) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-black/20 border border-zinc-800 rounded-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: service.color }} />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-white">{service.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: service.color }}>
                            localhost:{service.port}
                          </div>
                        </div>
                        <div
                          className="w-8 h-8 flex items-center justify-center border rounded-md"
                          style={{ borderColor: `${service.color}40`, background: `${service.color}15` }}
                        >
                          <Globe className="w-4 h-4" style={{ color: service.color }} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </FloatingCard3D>
            </motion.div>
          )}

          {/* DATABASES */}
          {activeSection === 'databases' && (
            <motion.div
              key="databases"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FloatingCard3D borderStyle="neon" depth={6}>
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <h2 className="text-sm font-medium text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-violet-500" />
                    Supported Databases
                  </h2>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {SUPPORTED_DBS.map((db, i) => (
                    <motion.div
                      key={db.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-3 bg-black/20 border border-zinc-800 rounded-md text-center hover:border-zinc-600 transition-colors"
                    >
                      <div className="text-2xl mb-1.5">{db.icon}</div>
                      <div className="text-xs font-medium text-white">{db.name}</div>
                    </motion.div>
                  ))}
                </div>
              </FloatingCard3D>
            </motion.div>
          )}

          {/* ABOUT */}
          {activeSection === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FloatingCard3D borderStyle="neon" depth={6}>
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <h2 className="text-sm font-medium text-white flex items-center gap-2">
                    <Info className="w-4 h-4 text-pink-500" />
                    About
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'VERSION', value: 'v1.0.0', color: '#3b82f6' },
                    { label: 'FRONTEND', value: 'React + Tailwind + Framer Motion', color: '#8b5cf6' },
                    { label: 'BACKEND', value: 'Rust + Axum', color: '#ec4899' },
                    { label: 'DATABASE', value: 'MySQL 8.0 (metadata)', color: '#22c55e' },
                    { label: 'UI STYLE', value: 'Modern Minimal / Industrial Sci-Fi', color: '#3b82f6' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-3 bg-black/20 border border-zinc-800 rounded-md"
                    >
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-medium" style={{ color: item.color }}>{item.value}</span>
                    </div>
                  ))}

                  <div className="pt-3 border-t border-zinc-800 text-center">
                    <p className="flex items-center justify-center gap-2 text-xs text-zinc-500">
                      Made with <Heart className="w-3 h-3 text-pink-500" /> using
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        <Github className="w-3 h-3" />
                        Open Source
                      </a>
                    </p>
                  </div>
                </div>
              </FloatingCard3D>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
