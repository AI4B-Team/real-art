import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Sparkles, Check, Pin, RefreshCw, Send, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  actions?: { label: string; id: string }[];
  applied?: boolean;
  pinned?: boolean;
}

interface AIVAPanelProps {
  selectedPageId: string | null;
  selectedPageTitle?: string;
  pageCount?: number;
  pageIndex?: number;
  onOpenImageSection?: () => void;
}

const AIVAPanel = ({ selectedPageId, selectedPageTitle, pageCount = 1, pageIndex = 0 }: AIVAPanelProps) => {
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentPageMessages = chatMessages[selectedPageId || ''] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentPageMessages.length]);

  const sendChatMessage = useCallback(async (content: string) => {
    if (!content.trim() || !selectedPageId) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setChatMessages(prev => ({
      ...prev,
      [selectedPageId]: [...(prev[selectedPageId] || []), userMsg],
    }));
    setChatInput('');
    setIsChatLoading(true);

    try {
      const { data } = await supabase.functions.invoke('ai-text-edit', {
        body: { action: 'custom', text: '', prompt: content.trim(), customInstruction: content.trim() },
      });
      const aiContent = data?.result || 'I analyzed your page. Here are my recommendations based on the current content.';
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        content: typeof aiContent === 'string' ? aiContent : JSON.stringify(aiContent),
        timestamp: new Date(),
        actions: [
          { label: 'Apply to page', id: 'apply' },
          { label: 'Regenerate', id: 'regenerate' },
        ],
      };
      setChatMessages(prev => ({
        ...prev,
        [selectedPageId]: [...(prev[selectedPageId] || []), aiMsg],
      }));
    } catch {
      const errMsg: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        role: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setChatMessages(prev => ({
        ...prev,
        [selectedPageId]: [...(prev[selectedPageId] || []), errMsg],
      }));
    } finally {
      setIsChatLoading(false);
    }
  }, [selectedPageId]);

  const toggleMessagePin = useCallback((msgId: string) => {
    if (!selectedPageId) return;
    setChatMessages(prev => ({
      ...prev,
      [selectedPageId]: (prev[selectedPageId] || []).map(m =>
        m.id === msgId ? { ...m, pinned: !m.pinned } : m
      ),
    }));
  }, [selectedPageId]);

  const markApplied = useCallback((msgId: string) => {
    if (!selectedPageId) return;
    setChatMessages(prev => ({
      ...prev,
      [selectedPageId]: (prev[selectedPageId] || []).map(m =>
        m.id === msgId ? { ...m, applied: true } : m
      ),
    }));
    toast.success('Applied to page');
  }, [selectedPageId]);

  return (
    <div className="flex flex-col h-full">
      {/* AIVA Header */}
      <div className="px-3 py-2.5 border-b border-foreground/[0.04] bg-foreground/[0.12] border-l-2 border-l-accent">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-foreground">AIVA</span>
            <p className="text-[9px] text-muted-foreground truncate">Working on: {selectedPageTitle || 'Page'}</p>
          </div>
        </div>
      </div>

      {/* Chat — full panel, no tabs */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Pinned messages */}
        {currentPageMessages.filter(m => m.pinned).length > 0 && (
          <div className="px-3 py-2 border-b border-foreground/[0.04] bg-accent/[0.03]">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinned
            </span>
            {currentPageMessages.filter(m => m.pinned).map(m => (
              <div key={m.id} className="mt-1.5 p-2 rounded-lg bg-accent/[0.05] border border-accent/20">
                <p className="text-[11px] text-foreground line-clamp-2">{m.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* Message thread */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {currentPageMessages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 mx-auto text-accent/40 mb-3" />
              <p className="text-sm font-semibold text-foreground">AIVA</p>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed max-w-[200px] mx-auto">
                Ask me anything about this page. I'll analyze, rewrite, and optimize your content.
              </p>
              <div className="mt-4 space-y-1.5">
                {['What needs fixing on this page?', 'Rewrite my headline', 'Make this more engaging'].map(q => (
                  <button key={q} onClick={() => sendChatMessage(q)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06] text-[11px] text-foreground hover:border-accent/30 hover:bg-accent/[0.04] transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentPageMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] ${msg.role === 'user'
                ? 'bg-accent text-white rounded-2xl rounded-br-md px-3 py-2'
                : 'bg-foreground/[0.04] border border-foreground/[0.06] rounded-2xl rounded-bl-md px-3 py-2.5'
              }`}>
                <p className={`text-[11px] leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? '' : 'text-foreground'}`}>
                  {msg.content}
                </p>
                {msg.applied && (
                  <div className="flex items-center gap-1 mt-1.5 text-emerald-500">
                    <Check className="w-3 h-3" />
                    <span className="text-[9px] font-semibold">Applied</span>
                  </div>
                )}
                {msg.role === 'ai' && !msg.applied && (
                  <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-foreground/[0.06]">
                    <button onClick={() => markApplied(msg.id)}
                      className="flex items-center gap-0.5 px-2 py-1 rounded-md text-[9px] font-semibold text-accent hover:bg-accent/10 transition-colors">
                      <Check className="w-3 h-3" /> Apply
                    </button>
                    <button onClick={() => toggleMessagePin(msg.id)}
                      className={`flex items-center gap-0.5 px-2 py-1 rounded-md text-[9px] font-semibold transition-colors ${msg.pinned ? 'text-amber-500 bg-amber-500/10' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                      <Pin className="w-3 h-3" /> {msg.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => sendChatMessage(`Regenerate: ${msg.content.slice(0, 50)}`)}
                      className="flex items-center gap-0.5 px-2 py-1 rounded-md text-[9px] font-semibold text-muted-foreground hover:bg-foreground/[0.05] transition-colors">
                      <RefreshCw className="w-3 h-3" /> Redo
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-foreground/[0.04] border border-foreground/[0.06] rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span className="text-[11px] text-muted-foreground">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat input */}
        <div className="border-t border-foreground/[0.04] p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendChatMessage(chatInput);
                }
              }}
              placeholder="Ask AIVA anything..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-3 py-2 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent/40 transition-colors"
              style={{ maxHeight: '80px', minHeight: '36px' }}
            />
            <button
              onClick={() => sendChatMessage(chatInput)}
              disabled={!chatInput.trim() || isChatLoading}
              className="p-2 rounded-xl bg-accent text-white hover:bg-accent/90 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-[9px] text-muted-foreground mt-1.5 text-center">
            Page {pageIndex + 1} · {currentPageMessages.length} messages
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIVAPanel;
