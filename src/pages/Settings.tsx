import { motion } from 'framer-motion';
import { Moon, Sun, Info, Github, Heart, Zap, Server, Database } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { NeonBorder } from '../components/effects/NeonBorder';
import { cn } from '../lib/utils';

export function Settings() {
  const { isDark, toggleTheme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* 页面标题 */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-cyber-text">设置</h1>
        <p className="text-cyber-muted mt-1">自定义你的体验</p>
      </motion.div>

      {/* 外观设置 */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isDark ? (
                <div className="p-3 rounded-lg bg-cyber-purple/10 border border-cyber-purple/30">
                  <Moon className="w-5 h-5 text-cyber-purple" />
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-cyber-cyan/10 border border-cyber-cyan/30">
                  <Sun className="w-5 h-5 text-cyber-cyan" />
                </div>
              )}
              <div>
                <h3 className="font-medium text-cyber-text">外观模式</h3>
                <p className="text-sm text-cyber-muted">
                  {isDark ? '当前为暗色模式' : '当前为亮色模式'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={toggleTheme}>
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  切换亮色
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  切换暗色
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* 后端服务信息 */}
      <motion.div variants={itemVariants}>
        <NeonBorder color="cyan" intensity="low">
          <Card className="p-6">
            <h3 className="font-medium text-cyber-text mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-cyber-cyan" />
              后端服务配置
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border">
                <span className="text-sm text-cyber-muted">Gateway</span>
                <p className="text-cyber-text font-mono">localhost:8080</p>
              </div>
              <div className="p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border">
                <span className="text-sm text-cyber-muted">Connection Service</span>
                <p className="text-cyber-text font-mono">localhost:8081</p>
              </div>
              <div className="p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border">
                <span className="text-sm text-cyber-muted">Query Service</span>
                <p className="text-cyber-text font-mono">localhost:8082</p>
              </div>
              <div className="p-3 rounded-lg bg-cyber-bg/50 border border-cyber-border">
                <span className="text-sm text-cyber-muted">AI Service</span>
                <p className="text-cyber-text font-mono">localhost:8083</p>
              </div>
            </div>
          </Card>
        </NeonBorder>
      </motion.div>

      {/* 支持的数据库 */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="font-medium text-cyber-text mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-cyber-purple" />
            支持的数据库类型
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'MongoDB',
              'ClickHouse', 'Elasticsearch', 'Oracle', 'SQL Server',
              'MariaDB', 'Cassandra', 'InfluxDB', 'Neo4j', 'HBase'
            ].map((db) => (
              <Badge key={db} variant="cyan">
                {db}
              </Badge>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* 关于 */}
      <motion.div variants={itemVariants}>
        <Card className="p-6">
          <h3 className="font-medium text-cyber-text mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-cyber-pink" />
            关于
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-cyber-border/50">
              <span className="text-cyber-muted">版本</span>
              <Badge variant="green" glow>v1.0.0</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cyber-border/50">
              <span className="text-cyber-muted">前端技术栈</span>
              <span className="text-cyber-text">React + Tailwind + Framer Motion</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-cyber-border/50">
              <span className="text-cyber-muted">后端技术栈</span>
              <span className="text-cyber-text">Rust + Axum</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-cyber-muted">UI 风格</span>
              <span className="text-cyber-cyan flex items-center gap-1">
                <Zap className="w-4 h-4" />
                赛博朋克
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* 页脚 */}
      <motion.div 
        variants={itemVariants}
        className="text-center py-6 text-cyber-muted text-sm"
      >
        <p className="flex items-center justify-center gap-2">
          Made with <Heart className="w-4 h-4 text-cyber-pink" /> using
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-cyber-cyan hover:underline"
          >
            <Github className="w-4 h-4" />
            Open Source
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
