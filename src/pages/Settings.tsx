import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Moon, Sun, Info, Github, Heart, Zap, Server, Database,
  Cpu, Globe, Shield, Palette, ChevronRight,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { FloatingCard3D, BrutalButton, DataPanel } from '../components/ui/BrutalComponents';
import { LiquidBlob, NoiseOverlay, ScanLines, HexGrid } from '../components/effects/LiquidBackground';
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
  { name: 'GATEWAY', port: 8080, color: '#00fff2' },
  { name: 'CONNECTION', port: 8081, color: '#00ff88' },
  { name: 'QUERY', port: 8082, color: '#bf00ff' },
  { name: 'AI SERVICE', port: 8083, color: '#ff00aa' },
];

export function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [activeSection, setActiveSection] = useState<string>('appearance');

  // 标题动画
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    gsap.fromTo(el,
      { y: -40, opacity: 0, skewY: 2 },
      { y: 0, opacity: 1, skewY: 0, duration: 0.6, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="relative min-h-screen">
      {/* 背景效果 */}
      <LiquidBlob colors={['#bf00ff', '#00fff2', '#ff00aa']} blur={120} speed={25} />
      <HexGrid opacity={0.04} />
      <NoiseOverlay opacity={0.02} />
      <ScanLines opacity={0.04} />

      <div className="relative z-10 p-6 lg:p-8">
        {/* 头部 */}
        <header className="mb-8">
          <motion.p
            className="text-xs font-mono text-cyber-cyan uppercase tracking-[0.3em] mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            SYSTEM CONFIGURATION
          </motion.p>
          <h1
            ref={titleRef}
            className="text-3xl lg:text-5xl font-black text-white uppercase tracking-tight"
          >
            SETTINGS
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-purple via-cyber-cyan to-cyber-pink">
              PANEL
            </span>
          </h1>
        </header>

        {/* 顶部状态面板 */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataPanel label="VERSION" value="v1.0.0" color="#00fff2" />
          <DataPanel label="THEME" value={isDark ? 'DARK' : 'LIGHT'} color="#bf00ff" />
          <DataPanel label="DATABASES" value={SUPPORTED_DBS.length} color="#00ff88" />
          <DataPanel label="SERVICES" value={SERVICES.length} color="#ff00aa" />
        </motion.div>

        {/* 主内容区 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 左侧 - 导航 */}
          <div className="lg:col-span-3">
            <FloatingCard3D borderStyle="brutal" depth={6}>
              <div className="p-4 border-b border-white/10">
                <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyber-cyan" />
                  SECTIONS
                </h2>
              </div>
              <div className="p-2">
                {[
                  { id: 'appearance', label: 'APPEARANCE', icon: Palette },
                  { id: 'services', label: 'SERVICES', icon: Server },
                  { id: 'databases', label: 'DATABASES', icon: Database },
                  { id: 'about', label: 'ABOUT', icon: Info },
                ].map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200',
                        'border-l-4',
                        isActive
                          ? 'border-l-cyber-cyan bg-cyber-cyan/10 text-cyber-cyan'
                          : 'border-l-transparent text-white/50 hover:text-white hover:bg-white/5'
                      )}
                      whileHover={{ x: 4 }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">{section.label}</span>
                      <ChevronRight className={cn('w-3 h-3 ml-auto transition-transform', isActive && 'text-cyber-cyan')} />
                    </motion.button>
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
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FloatingCard3D borderStyle="neon" depth={6}>
                  <div className="p-4 border-b border-white/10">
                    <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Palette className="w-4 h-4 text-cyber-purple" />
                      APPEARANCE
                    </h2>
                  </div>
                  <div className="p-6">
                    {/* 主题切换 */}
                    <div className="flex items-center justify-between p-5 bg-black/40 border border-white/10 mb-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          'w-12 h-12 flex items-center justify-center border',
                          isDark ? 'border-cyber-purple/50 bg-cyber-purple/10' : 'border-cyber-cyan/50 bg-cyber-cyan/10'
                        )}>
                          {isDark ? <Moon className="w-6 h-6 text-cyber-purple" /> : <Sun className="w-6 h-6 text-cyber-cyan" />}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-white uppercase tracking-wide text-sm">
                            THEME MODE
                          </div>
                          <div className="text-xs font-mono text-white/40 mt-1">
                            CURRENT: {isDark ? 'DARK MODE' : 'LIGHT MODE'}
                          </div>
                        </div>
                      </div>
                      <BrutalButton
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                      >
                        {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                        {isDark ? 'LIGHT' : 'DARK'}
                      </BrutalButton>
                    </div>

                    {/* UI 风格信息 */}
                    <div className="p-5 bg-black/40 border border-white/10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center border border-cyber-pink/50 bg-cyber-pink/10">
                          <Zap className="w-6 h-6 text-cyber-pink" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-white uppercase tracking-wide text-sm">
                            UI STYLE
                          </div>
                          <div className="text-xs font-mono text-cyber-cyan mt-1">
                            INDUSTRIAL CYBERPUNK / BRUTALIST SCI-FI
                          </div>
                        </div>
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
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FloatingCard3D borderStyle="neon" depth={6}>
                  <div className="p-4 border-b border-white/10">
                    <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Server className="w-4 h-4 text-cyber-green" />
                      BACKEND SERVICES
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SERVICES.map((service, i) => (
                      <motion.div
                        key={service.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="p-4 bg-black/40 border border-white/10 relative overflow-hidden"
                      >
                        {/* 顶部色条 */}
                        <div
                          className="absolute top-0 left-0 right-0 h-1"
                          style={{ background: service.color }}
                        />
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-mono font-bold text-white text-sm uppercase tracking-wide">
                              {service.name}
                            </div>
                            <div className="font-mono text-xs mt-1" style={{ color: service.color }}>
                              localhost:{service.port}
                            </div>
                          </div>
                          <div
                            className="w-8 h-8 flex items-center justify-center border"
                            style={{ borderColor: `${service.color}50`, background: `${service.color}15` }}
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
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FloatingCard3D borderStyle="neon" depth={6}>
                  <div className="p-4 border-b border-white/10">
                    <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyber-purple" />
                      SUPPORTED DATABASES
                    </h2>
                  </div>
                  <div className="p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {SUPPORTED_DBS.map((db, i) => (
                      <motion.div
                        key={db.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-3 bg-black/40 border border-white/10 text-center hover:border-white/30 transition-colors"
                        style={{
                          clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                        }}
                      >
                        <div className="text-2xl mb-2">{db.icon}</div>
                        <div className="font-mono font-bold text-xs text-white uppercase">{db.name}</div>
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
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <FloatingCard3D borderStyle="neon" depth={6}>
                  <div className="p-4 border-b border-white/10">
                    <h2 className="font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Info className="w-4 h-4 text-cyber-pink" />
                      ABOUT
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {/* 信息行 */}
                    {[
                      { label: 'VERSION', value: 'v1.0.0', color: '#00fff2' },
                      { label: 'FRONTEND', value: 'React + Tailwind + Framer Motion', color: '#bf00ff' },
                      { label: 'BACKEND', value: 'Rust + Axum', color: '#ff00aa' },
                      { label: 'DATABASE', value: 'MySQL 8.0 (metadata)', color: '#00ff88' },
                      { label: 'UI STYLE', value: 'Cyberpunk / Industrial Sci-Fi', color: '#00fff2' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-4 bg-black/40 border border-white/10"
                      >
                        <span className="text-xs font-mono text-white/40 uppercase tracking-wider">{item.label}</span>
                        <span className="font-mono text-sm font-semibold" style={{ color: item.color }}>
                          {item.value}
                        </span>
                      </div>
                    ))}

                    {/* 页脚 */}
                    <div className="pt-4 border-t border-white/10 text-center">
                      <p className="flex items-center justify-center gap-2 text-xs font-mono text-white/40">
                        MADE WITH <Heart className="w-3 h-3 text-cyber-pink" /> USING
                        <a
                          href="https://github.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-cyber-cyan hover:text-cyber-cyan/80 transition-colors"
                        >
                          <Github className="w-3 h-3" />
                          OPEN SOURCE
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
    </div>
  );
}
