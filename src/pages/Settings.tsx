import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Moon, Sun, Info, Github, Heart, Server, Database,
  Cpu, Globe, Palette, ChevronRight,
} from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Card, Button, DataPanel } from '../components/ui/BrutalComponents';
import { cn } from '../lib/utils';

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
      <header className="mb-6">
        <h1 className="text-xl font-semibold text-[var(--text)]">Settings</h1>
        <p className="text-xs text-[var(--text-m)] mt-0.5">System configuration & information</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DataPanel label="VERSION" value="v1.0.0" />
        <DataPanel label="THEME" value={isDark ? 'DARK' : 'LIGHT'} />
        <DataPanel label="DATABASES" value={SUPPORTED_DBS.length} />
        <DataPanel label="SERVICES" value={SERVICES.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <div className="px-4 py-3 border-b border-[var(--border)]">
              <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[var(--text-s)]" /> Sections
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
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md transition-colors duration-150',
                      isActive
                        ? 'bg-[var(--accent)] text-[var(--bg)]'
                        : 'text-[var(--text-s)] hover:text-[var(--text)] hover:bg-[var(--surface-hover)]'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[13px] font-medium">{section.label}</span>
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-9">
          {activeSection === 'appearance' && (
            <motion.div key="appearance" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
              <Card>
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[var(--text-s)]" /> Appearance
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-s)] border border-[var(--border)] rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-md bg-[var(--bg)]">
                        {isDark ? <Moon className="w-5 h-5 text-[var(--text-s)]" /> : <Sun className="w-5 h-5 text-[var(--text-s)]" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--text)]">Theme Mode</div>
                        <div className="text-xs text-[var(--text-m)] mt-0.5">Current: {isDark ? 'Dark Mode' : 'Light Mode'}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={toggleTheme}>
                      {isDark ? <Sun className="w-4 h-4 mr-1.5" /> : <Moon className="w-4 h-4 mr-1.5" />}
                      {isDark ? 'Light' : 'Dark'}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-[var(--bg-s)] border border-[var(--border)] rounded-md">
                    <div className="w-10 h-10 flex items-center justify-center border border-[var(--border)] rounded-md bg-[var(--bg)]">
                      <Palette className="w-5 h-5 text-[var(--text-s)]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--text)]">UI Style</div>
                      <div className="text-xs text-[var(--text-m)] mt-0.5">Minimal Black & White</div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'services' && (
            <motion.div key="services" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
              <Card>
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-500" /> Backend Services
                  </h2>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES.map((service, i) => (
                    <motion.div
                      key={service.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 bg-[var(--bg-s)] border border-[var(--border)] rounded-md relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: service.color }} />
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-[var(--text)]">{service.name}</div>
                          <div className="text-xs mt-0.5" style={{ color: service.color }}>localhost:{service.port}</div>
                        </div>
                        <div className="w-8 h-8 flex items-center justify-center border border-[var(--border)] rounded-md bg-[var(--bg)]">
                          <Globe className="w-4 h-4" style={{ color: service.color }} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'databases' && (
            <motion.div key="databases" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
              <Card>
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                    <Database className="w-4 h-4 text-[var(--text-s)]" /> Supported Databases
                  </h2>
                </div>
                <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {SUPPORTED_DBS.map((db, i) => (
                    <motion.div
                      key={db.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-3 bg-[var(--bg-s)] border border-[var(--border)] rounded-md text-center hover:border-[var(--border-hover)] transition-colors"
                    >
                      <div className="text-2xl mb-1.5">{db.icon}</div>
                      <div className="text-xs font-medium text-[var(--text)]">{db.name}</div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'about' && (
            <motion.div key="about" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
              <Card>
                <div className="px-4 py-3 border-b border-[var(--border)]">
                  <h2 className="text-sm font-medium text-[var(--text)] flex items-center gap-2">
                    <Info className="w-4 h-4 text-[var(--text-s)]" /> About
                  </h2>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: 'VERSION', value: 'v1.0.0' },
                    { label: 'FRONTEND', value: 'React + Tailwind + Framer Motion' },
                    { label: 'BACKEND', value: 'Rust + Axum' },
                    { label: 'DATABASE', value: 'MySQL 8.0 (metadata)' },
                    { label: 'UI STYLE', value: 'Minimal Black & White' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 bg-[var(--bg-s)] border border-[var(--border)] rounded-md">
                      <span className="text-xs text-[var(--text-m)] uppercase tracking-wider">{item.label}</span>
                      <span className="text-sm font-medium text-[var(--text)]">{item.value}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-[var(--border)] text-center">
                    <p className="flex items-center justify-center gap-2 text-xs text-[var(--text-m)]">
                      Made with <Heart className="w-3 h-3 text-red-500" /> using
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[var(--text-s)] hover:text-[var(--text)] transition-colors">
                        <Github className="w-3 h-3" /> Open Source
                      </a>
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
