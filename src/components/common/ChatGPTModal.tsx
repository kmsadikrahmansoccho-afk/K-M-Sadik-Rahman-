import React, { useState } from 'react';
import {
  Sparkles,
  ExternalLink,
  X,
  Send,
  Copy,
  Check,
  Bot,
  User as UserIcon,
  Loader2,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import { api } from '../../services/api';

interface ChatGPTModalProps {
  isOpen: boolean;
  onClose: () => void;
  contextBookTitle?: string;
  contextSubject?: string;
  contextChapterTitle?: string;
}

export const ChatGPTModal: React.FC<ChatGPTModalProps> = ({
  isOpen,
  onClose,
  contextBookTitle,
  contextSubject,
  contextChapterTitle,
}) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: contextBookTitle
        ? `Hello! I am your AI Study Assistant linked with ChatGPT. I see you are studying **${contextBookTitle}**${contextChapterTitle ? ` (${contextChapterTitle})` : ''}. How can I help you understand this topic or prepare for your exam?`
        : `Hello! I am your AI Study Assistant linked with ChatGPT for Shikkhora. You can ask me any question about NCTB Class 1–10 subjects, C programming, or HTML development in Bangla or English!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    contextBookTitle
      ? `Explain the key concepts of ${contextBookTitle} in simple Bangla`
      : 'Explain the scientific method with examples in Bangla',
    contextChapterTitle
      ? `Give me 5 practice questions for ${contextChapterTitle}`
      : 'Give me 5 NCTB quiz questions with answers',
    'Summarize this chapter for exam preparation',
    'Show step-by-step mathematical problem solution',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = { role: 'user' as const, content: query };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const promptWithContext = contextBookTitle
        ? `[Context: Student is studying NCTB book "${contextBookTitle}", Subject: "${contextSubject || ''}", Chapter: "${contextChapterTitle || ''}"] Question: ${query}`
        : query;

      const res = await api.askAiTutor(promptWithContext, newMessages.slice(-6), 'mixed');
      setMessages([...newMessages, { role: 'assistant', content: res.response }]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'I encountered an issue connecting. You can also open this query directly in ChatGPT using the button above!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChatGPT = (customPrompt?: string) => {
    const prompt = customPrompt || (contextBookTitle ? `I am an NCTB student in Bangladesh studying "${contextBookTitle}". Please act as my tutor and explain key concepts:` : 'Hello ChatGPT, please act as my educational tutor for Bangladesh NCTB curriculum:');
    const url = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 shadow-md">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">ChatGPT & AI Study Assistant</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live Linked
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {contextBookTitle ? `Assisting with: ${contextBookTitle}` : 'Bangla & English academic tutoring'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenChatGPT()}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open ChatGPT in official website"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open ChatGPT</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/40 text-[11px] whitespace-nowrap transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-950/40">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.content}</div>

                {m.role === 'assistant' && (
                  <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>AI Tutor Response</span>
                    <button
                      onClick={() => handleCopyPrompt(m.content)}
                      className="inline-flex items-center gap-1 hover:text-emerald-400 transition-colors"
                      title="Copy response"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span>ChatGPT is formulating your answer...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={contextBookTitle ? `Ask anything about ${contextBookTitle}...` : 'Type your question in Bangla or English...'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-md active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};
