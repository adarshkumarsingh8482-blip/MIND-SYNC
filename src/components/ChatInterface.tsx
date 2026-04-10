import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Calculator, Book, Code, RefreshCcw, User, Bot, ChevronRight } from 'lucide-react';
import { chatWithGemini, Message } from '@/src/services/gemini';
import { MathRenderer } from './MathRenderer';
import { cn } from '@/src/lib/utils';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Welcome to **MathMind AI**. I am your expert assistant for applied mathematics. \n\nHow can I assist you today? You can ask me about:\n- Solving differential equations\n- Optimization problems\n- Numerical methods\n- Mathematical modeling in physics or engineering"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const history = [...messages, userMessage];
    const response = await chatWithGemini(history);
    
    setMessages(prev => [...prev, { role: 'model', content: response }]);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: "Session reset. How can I help with your next mathematical challenge?"
      }
    ]);
  };

  return (
    <div className="flex flex-col h-screen max-w-5xl mx-auto border-x border-math-line/20 bg-math-bg shadow-2xl overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-math-line bg-math-bg z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-zinc-900 border border-math-line text-math-accent rounded-sm shadow-[var(--shadow-accent)]">
            <Calculator size={20} />
          </div>
          <div>
            <h1 className="font-mono font-bold text-sm tracking-tighter uppercase">MathMind AI // v1.0</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Applied Mathematics Engine</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-zinc-900 border border-transparent hover:border-math-line transition-all rounded-sm group"
          title="Reset Session"
        >
          <RefreshCcw size={18} className="text-math-ink/50 group-hover:text-math-accent group-active:rotate-180 transition-all duration-500" />
        </button>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 math-grid scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-[90%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-sm border shadow-[var(--shadow-accent)]",
                msg.role === 'user' ? "bg-math-accent text-white border-math-accent" : "bg-zinc-900 text-math-accent border-math-line"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              
              <div className={cn(
                "flex flex-col gap-1",
                msg.role === 'user' ? "items-end" : "items-start"
              )}>
                <div className={cn(
                  "px-4 py-3 rounded-sm border border-math-line shadow-sm",
                  msg.role === 'user' ? "bg-zinc-900/80" : "bg-zinc-900/40 backdrop-blur-sm"
                )}>
                  <MathRenderer content={msg.content} />
                </div>
                <span className="text-[9px] uppercase font-mono opacity-40">
                  {msg.role === 'user' ? 'System Input' : 'Engine Output'} // {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 mr-auto"
          >
            <div className="w-8 h-8 flex items-center justify-center rounded-sm border border-math-line bg-zinc-900 text-math-accent animate-pulse">
              <Bot size={16} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="px-4 py-3 rounded-sm border border-math-line bg-zinc-900/40 backdrop-blur-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-math-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-math-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-math-accent rounded-full animate-bounce"></span>
              </div>
              <span className="text-[9px] uppercase font-mono opacity-40 animate-pulse">Computing Derivations...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-math-line bg-black/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <div className="absolute left-4 text-math-line/30 pointer-events-none">
            <ChevronRight size={18} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter mathematical query or model parameters..."
            className="w-full bg-zinc-900/50 border border-math-line px-10 py-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-math-accent focus:shadow-[var(--shadow-accent)] transition-all placeholder:opacity-30 text-math-ink"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-zinc-900 border border-math-line text-math-accent hover:bg-math-accent hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-zinc-900"
          >
            <Send size={18} />
          </button>
        </form>
        
        {/* Quick Actions */}
        <div className="flex gap-4 mt-4 overflow-x-auto pb-2 no-scrollbar">
          {[
            { icon: <Calculator size={12} />, label: "Solve ODE", query: "Can you help me solve the second-order ODE: y'' + 2y' + 5y = sin(x)?" },
            { icon: <Book size={12} />, label: "Explain Fourier", query: "Explain the intuition behind Fourier Transforms in signal processing." },
            { icon: <Code size={12} />, label: "Python Model", query: "Write a Python script using SciPy to solve a system of linear equations." },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => setInput(action.query)}
              className="flex items-center gap-2 px-3 py-1.5 border border-math-line rounded-sm bg-zinc-900/50 hover:bg-math-accent hover:border-math-accent transition-all text-[10px] uppercase font-mono whitespace-nowrap text-math-ink/70 hover:text-white"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer Meta */}
      <footer className="px-6 py-2 border-t border-math-line/10 bg-math-bg text-[8px] uppercase font-mono opacity-30 flex justify-between">
        <span>Status: Operational</span>
        <span>Precision: Double-64</span>
        <span>© 2026 MathMind Systems</span>
      </footer>
    </div>
  );
}
