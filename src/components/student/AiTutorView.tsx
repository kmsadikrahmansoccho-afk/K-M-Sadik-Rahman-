import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api';
import type { User, AiChatMessage } from '../../types';
import {
  Send,
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ChevronLeft,
  Loader2,
  Trash2,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Lightbulb,
} from 'lucide-react';

interface AiTutorViewProps {
  user: User;
  onBack: () => void;
}

export const AiTutorView: React.FC<AiTutorViewProps> = ({ user, onBack }) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'welcome_1',
      role: 'assistant',
      content: `Assalamu Alaikum, **${user.fullName}**! I am your **Shikkhora AI Tutor**, tailored for Class **${user.studentClass || 9}** of the Bangladesh NCTB curriculum.\n\nYou can ask me questions in **Bangla (বাংলা)** or **English**, upload a photo of a math problem or diagram, or use voice input. How can I assist your learning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [language, setLanguage] = useState<'mixed' | 'bn' | 'en'>('mixed');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Image Upload / Camera states
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Voice Input using Web Speech API (Recognition)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use text input.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Text-to-Speech Output
  const speakText = (msgId: string, text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`$]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Image selection handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file is too large. Please select an image under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      setSelectedImage({
        base64,
        mimeType: file.type || 'image/jpeg',
        preview: result,
      });
    };
    reader.readAsDataURL(file);
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text && !selectedImage) return;

    const userMessage: AiChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text || 'Please analyze this uploaded educational image or problem.',
      imageUrl: selectedImage?.preview,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    const imageToAnalyze = selectedImage;
    setSelectedImage(null);

    try {
      let aiResponseText = '';
      if (imageToAnalyze) {
        // Send image analysis request
        const res = await api.analyzeImage(imageToAnalyze.base64, imageToAnalyze.mimeType, text);
        aiResponseText = res.analysis;
      } else {
        // Send text chat request with history
        const history = messages.slice(-5).map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));
        const res = await api.askAiTutor(text, history, language);
        aiResponseText = res.response;
      }

      const assistantMessage: AiChatMessage = {
        id: `msg_asst_${Date.now()}`,
        role: 'assistant',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: AiChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `Error receiving AI answer: ${err.message || 'Please check connection.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Quick prompt suggestions
  const quickPrompts = [
    'Explain Newton\'s Second Law with a bicycle example in Dhaka',
    'How do I calculate least count of a Vernier Caliper?',
    'Solve: 2x² + 5x - 3 = 0 step by step',
    'পড়ন্ত বস্তুর গ্যালিলিওর সূত্রসমূহ সহজ ভাষায় ব্যাখ্যা করো',
  ];

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Return to Student Dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Shikkhora AI Learning Workspace
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Personalized for Class {user.studentClass || 9} · Bangla & English Supported
            </p>
          </div>
        </div>

        {/* Language selector & conversation reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setLanguage('mixed')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                language === 'mixed' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bilingual
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 rounded-lg font-medium font-bn transition-colors ${
                language === 'bn' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                language === 'en' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Clear current AI conversation history?')) {
                setMessages([
                  {
                    id: 'welcome_reset',
                    role: 'assistant',
                    content: 'Conversation cleared. Ready for your next academic question!',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ]);
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Canvas */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-sky-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-none shadow-sm'
              }`}
            >
              {/* Optional Uploaded Image Preview in User Message */}
              {msg.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden border border-emerald-400/30 max-h-60">
                  <img src={msg.imageUrl} alt="Uploaded student question" className="w-full object-contain" />
                </div>
              )}

              {/* Message Content formatted with Markdown/prose */}
              <div className="prose prose-invert max-w-none text-xs sm:text-sm whitespace-pre-line">
                {msg.content}
              </div>

              {/* Message Footer: Timestamp and Voice Readout */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/40 flex items-center justify-between text-[10px] text-slate-400">
                <span>{msg.timestamp}</span>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speakText(msg.id, msg.content)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Read answer aloud"
                  >
                    {speakingMessageId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 font-bold text-xs mt-1">
                {user.fullName.charAt(0)}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Shikkhora AI is formulating step-by-step guidance...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </main>

      {/* Suggested Quick Inquiry Prompts */}
      {messages.length <= 2 && (
        <div className="px-4 sm:px-8 py-2 max-w-4xl mx-auto w-full">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Suggested Questions:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => {
                  setInputValue(prompt);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Bar with Image & Voice */}
      <footer className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 sm:px-8 py-4">
        <div className="max-w-4xl mx-auto w-full">
          {/* Selected Image Thumbnail preview if attached */}
          {selectedImage && (
            <div className="mb-2 p-2 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between max-w-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <img src={selectedImage.preview} alt="Attached" className="w-10 h-10 object-cover rounded" />
                <span className="text-xs text-slate-300 truncate">Image ready for analysis</span>
              </div>
              <button
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded text-slate-400 hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            {/* Hidden file input for photos */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageFileChange}
            />

            {/* Photo / Diagram Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
              title="Upload question photo or diagram"
            >
              <Camera className="w-5 h-5" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-3 rounded-xl border transition-colors ${
                isListening
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                  : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-emerald-400'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Speak your question'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Main Text Input */}
            <input
              type="text"
              placeholder={
                selectedImage
                  ? 'Add notes or click Send to analyze image...'
                  : isListening
                  ? 'Listening to speech...'
                  : 'Ask about NCTB physics, math, grammar, chemistry...'
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || (!inputValue.trim() && !selectedImage)}
              className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all disabled:opacity-40 disabled:hover:bg-emerald-500 font-bold"
              title="Send question"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};
