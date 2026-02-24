import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '../components/ui/BrutalComponents';
import { useNotification } from '../components/effects/Notification';
import { getConnections, executeQuery } from '../api/modules/connections';
import { aiQuery } from '../api/modules/ai';
import type {
  ConnectionItem,
  NaturalQueryResponse,
  ChatMessage,
  QueryResult,
} from '../types/connection';

// Chat message display type
interface ChatDisplayMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
  explanation?: string;
  confidence?: number;
  status?: 'ready' | 'need_clarification' | 'failed';
  sourceTables?: string[];
  timestamp: Date;
}

export default function AiQuery() {
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [selectedConnId, setSelectedConnId] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [queryResults, setQueryResults] = useState<Record<string, QueryResult>>({});
  const [executingIds, setExecutingIds] = useState<Set<string>>(new Set());
  const [executeErrors, setExecuteErrors] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { addNotification } = useNotification();

  // load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  // scroll to bottom when new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadConnections() {
    try {
      const res = await getConnections();
      const list = res.data || [];
      setConnections(list);
      if (list.length > 0 && !selectedConnId) {
        setSelectedConnId(list[0].id);
      }
    } catch (e: any) {
      addNotification('error', '加载连接列表失败');
    }
  }

  async function handleSend() {
    if (!question.trim()) return;
    if (!selectedConnId) {
      addNotification('warning', '请先选择一个数据库连接');
      return;
    }

    const userMsg: ChatDisplayMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuestion = question.trim();
    setQuestion('');
    setLoading(true);

    try {
      // Build conversation history
      const history: ChatMessage[] = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role,
          content: m.role === 'user' ? m.content : m.sql || m.content,
        }));

      const res = await aiQuery({
        request_id: crypto.randomUUID(),
        question: currentQuestion,
        connection_id: selectedConnId,
        context:
          history.length > 0
            ? { session_id: sessionId, history }
            : undefined,
      });

      const data: NaturalQueryResponse = res.data;

      const assistantMsg: ChatDisplayMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.explanation || '已生成 SQL 查询',
        sql: data.sql || undefined,
        explanation: data.explanation || undefined,
        confidence: data.confidence ?? undefined,
        status: data.status,
        sourceTables: data.lineage_summary?.source_tables,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      const errorMsg: ChatDisplayMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: e.parsedMessage || e.message || 'AI 服务调用失败',
        status: 'failed',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      addNotification('error', e.parsedMessage || 'AI 查询失败');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function copySql(sql: string) {
    navigator.clipboard.writeText(sql);
    addNotification('success', 'SQL 已复制到剪贴板');
  }

  function clearChat() {
    setMessages([]);
    setQueryResults({});
    setExecutingIds(new Set());
  }

  async function handleExecuteSql(msgId: string, sql: string) {
    if (!selectedConnId || executingIds.has(msgId)) return;
    setExecutingIds((prev) => new Set(prev).add(msgId));
    // 清除之前的错误
    setExecuteErrors((prev) => {
      const next = { ...prev };
      delete next[msgId];
      return next;
    });
    
    try {
      const res = await executeQuery(selectedConnId, sql);
      setQueryResults((prev) => ({ ...prev, [msgId]: res.data }));
      // 使用安全的 addNotification 调用
      if (typeof addNotification === 'function') {
        addNotification('success', `查询完成，返回 ${res.data.row_count} 条记录 (耗时 ${res.data.execution_time_ms}ms)`);
      }
    } catch (e: any) {
      const errorMsg = e.parsedMessage || e.message || 'SQL 执行失败';
      setExecuteErrors((prev) => ({ ...prev, [msgId]: errorMsg }));
      // 使用安全的 addNotification 调用
      if (typeof addNotification === 'function') {
        addNotification('error', errorMsg);
      }
    } finally {
      setExecutingIds((prev) => {
        const next = new Set(prev);
        next.delete(msgId);
        return next;
      });
    }
  }

  const selectedConn = connections.find((c) => c.id === selectedConnId);

  return (
    <div className="h-full flex flex-col max-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-sm font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text)]">AI 查询助手</h1>
              <p className="text-xs text-[var(--text-m)]">自然语言转 SQL - Powered by DeepSeek</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Connection selector */}
            <select
              value={selectedConnId}
              onChange={(e) => setSelectedConnId(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--border-hover)] transition-colors"
            >
              <option value="">选择数据库连接...</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.db_type}{c.database ? ` / ${c.database}` : ''})
                </option>
              ))}
            </select>

            <Button variant="ghost" size="sm" onClick={clearChat}>
              清空对话
            </Button>
          </div>
        </div>

        {/* Connection info badge */}
        {selectedConn && (
          <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-m)]">
            <span className="px-2 py-0.5 rounded bg-[var(--surface-hover)] text-[var(--text-s)]">
              {selectedConn.db_type.toUpperCase()}
            </span>
            {selectedConn.host && (
              <span>{selectedConn.host}:{selectedConn.port}</span>
            )}
            {selectedConn.database && (
              <span className="text-[var(--accent)]">{selectedConn.database}</span>
            )}
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-600/20 flex items-center justify-center mb-4">
              <span className="text-3xl">AI</span>
            </div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-2">
              用自然语言查询数据库
            </h2>
            <p className="text-sm text-[var(--text-m)] max-w-md mb-6">
              选择一个数据库连接，然后用中文描述你想查询的内容，AI 会自动生成 SQL。
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-lg">
              {[
                '查询所有表的数据量',
                '最近创建的10条记录',
                '按状态统计订单数量',
                '查看数据库中有哪些表',
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => {
                    setQuestion(hint);
                    textareaRef.current?.focus();
                  }}
                  className="px-3 py-2 text-xs text-left rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-s)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)] transition-colors"
                >
                  "{hint}"
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'user' ? (
                /* User message */
                <div className="max-w-[80%]">
                  <div className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--bg)] text-sm">
                    {msg.content}
                  </div>
                  <div className="text-[10px] text-[var(--text-m)] mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                /* Assistant message */
                <div className="max-w-[85%] w-full">
                  <Card className="overflow-hidden">
                    <div className="p-4">
                      {/* Status badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            msg.status === 'ready'
                              ? 'bg-green-500/10 text-green-500'
                              : msg.status === 'need_clarification'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {msg.status === 'ready'
                            ? 'SQL 已生成'
                            : msg.status === 'need_clarification'
                            ? '需要更多信息'
                            : '生成失败'}
                        </span>
                        {msg.confidence != null && (
                          <span className="text-xs text-[var(--text-m)]">
                            置信度: {(msg.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>

                      {/* Explanation */}
                      {msg.explanation && (
                        <p className="text-sm text-[var(--text-s)] mb-3">{msg.explanation}</p>
                      )}

                      {/* SQL block */}
                      {msg.sql && (
                        <div className="relative group">
                          <pre className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm font-mono text-[var(--text)] overflow-x-auto whitespace-pre-wrap">
                            {msg.sql}
                          </pre>
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copySql(msg.sql!)}
                              className="px-2 py-1 rounded text-xs bg-[var(--surface-hover)] text-[var(--text-m)] hover:text-[var(--text)]"
                            >
                              复制
                            </button>
                          </div>
                          {/* Execute button */}
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleExecuteSql(msg.id, msg.sql!)}
                              disabled={executingIds.has(msg.id) || !selectedConnId}
                            >
                              {executingIds.has(msg.id) ? '执行中...' : '▶ 执行查询'}
                            </Button>
                            {queryResults[msg.id] && (
                              <span className="text-xs text-[var(--text-m)]">
                                {queryResults[msg.id].row_count} 条记录 · {queryResults[msg.id].execution_time_ms}ms
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Execute Error Message */}
                      {executeErrors[msg.id] && (
                        <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <div>
                              <div className="text-sm font-medium text-red-500 mb-1">执行失败</div>
                              <div className="text-xs text-[var(--text-m)]">{executeErrors[msg.id]}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Query Results Table */}
                      {queryResults[msg.id] && queryResults[msg.id].columns.length > 0 && (
                        <div className="mt-3 border border-[var(--border)] rounded-lg overflow-hidden">
                          <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                            <table className="w-full text-xs">
                              <thead className="sticky top-0">
                                <tr className="bg-[var(--surface-hover)]">
                                  <th className="px-3 py-2 text-left font-medium text-[var(--text-m)] border-b border-[var(--border)] w-10">#</th>
                                  {queryResults[msg.id].columns.map((col, i) => (
                                    <th key={i} className="px-3 py-2 text-left font-medium text-[var(--text-m)] border-b border-[var(--border)] whitespace-nowrap">
                                      {col.name}
                                      <span className="ml-1 text-[10px] text-[var(--text-m)] opacity-60">{col.data_type}</span>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {queryResults[msg.id].rows.map((row, ri) => (
                                  <tr key={ri} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-hover)] transition-colors">
                                    <td className="px-3 py-1.5 text-[var(--text-m)] font-mono">{ri + 1}</td>
                                    {row.map((val, ci) => (
                                      <td key={ci} className="px-3 py-1.5 text-[var(--text)] font-mono whitespace-nowrap max-w-[300px] truncate" title={String(val ?? 'NULL')}>
                                        {val === null ? <span className="text-[var(--text-m)] italic">NULL</span> : String(val)}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* No SQL - show content */}
                      {!msg.sql && msg.content && msg.role === 'assistant' && (
                        <p className="text-sm text-[var(--text)]">{msg.content}</p>
                      )}

                      {/* Source tables */}
                      {msg.sourceTables && msg.sourceTables.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          <span className="text-xs text-[var(--text-m)]">涉及表:</span>
                          {msg.sourceTables.map((t) => (
                            <span
                              key={t}
                              className="px-1.5 py-0.5 rounded text-xs bg-[var(--surface-hover)] text-[var(--text-s)] font-mono"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                  <div className="text-[10px] text-[var(--text-m)] mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <Card className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-xs text-[var(--text-m)]">AI 思考中...</span>
              </div>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedConnId
                ? '描述你想查询的内容，例如：查询最近一周的数据...'
                : '请先选择数据库连接'
            }
            disabled={!selectedConnId || loading}
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] text-sm outline-none placeholder-[var(--text-m)] focus:border-[var(--border-hover)] transition-colors disabled:opacity-50"
            style={{ minHeight: '42px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
          <Button
            variant="primary"
            size="lg"
            onClick={handleSend}
            disabled={!question.trim() || !selectedConnId || loading}
            className="flex-shrink-0"
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ↻
              </motion.span>
            ) : (
              '发送'
            )}
          </Button>
        </div>
        <div className="mt-1.5 text-[10px] text-[var(--text-m)]">
          Enter 发送 / Shift + Enter 换行
        </div>
      </div>
    </div>
  );
}
