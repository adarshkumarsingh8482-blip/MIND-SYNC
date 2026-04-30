import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Calculator, Book, Code, RefreshCcw, User, Bot, 
  ChevronRight, Camera, Mic, Image as ImageIcon, X, 
  Copy, Check, History, Trash2, Download, Bookmark, 
  BookmarkCheck, Menu, Info, ExternalLink, Star, MessageSquare,
  Keyboard, GraduationCap, Sparkles
} from 'lucide-react';
import { chatWithGemini, Message } from '@/src/services/gemini';
import { MathRenderer } from './MathRenderer';
import { MathGraph } from './MathGraph';
import { MathKeyboard } from './MathKeyboard';
import { QuizSystem } from './QuizSystem';
import { FORMULA_DATA } from '@/src/constants/formulas';
import { cn } from '@/src/lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Memoized Message Item to prevent unnecessary re-renders of the whole list
const MessageItem = memo(({ msg, index, handleRate, handleFeedback, feedbackIndex, setFeedbackIndex, toggleSaveMessage, copyMessage, copiedId }: any) => {
  return (
    <motion.div
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
        "flex flex-col gap-1 group relative",
        msg.role === 'user' ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-sm border border-math-line shadow-sm relative",
          msg.role === 'user' ? "bg-zinc-900/80" : "bg-zinc-900/40 backdrop-blur-sm"
        )}>
          {msg.image && (
            <img src={msg.image} alt="User upload" className="max-w-xs rounded-sm mb-3 border border-math-line" />
          )}
          
          <MathRenderer content={msg.content} />
          
          {msg.graph && (
            <MathGraph graph={msg.graph} />
          )}

          {msg.quiz && (
            <div className="mt-6">
              <QuizSystem 
                topic={msg.quiz.topic} 
                questions={msg.quiz.questions} 
              />
            </div>
          )}
          
          {/* Rating & Feedback */}
          {msg.role === 'model' && index !== 0 && !msg.quiz && (
            <div className="mt-4 pt-4 border-t border-math-line/30">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(index, star)}
                      className={cn(
                        "p-1 transition-all hover:scale-110",
                        (msg.rating || 0) >= star ? "text-yellow-500" : "text-math-ink/20 hover:text-yellow-500/50"
                      )}
                    >
                      <Star size={14} fill={(msg.rating || 0) >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                {msg.rating && !msg.feedback && feedbackIndex === index && (
                  <button 
                    onClick={() => setFeedbackIndex(index)}
                    className="text-[9px] uppercase font-mono text-math-accent hover:underline flex items-center gap-1"
                  >
                    <MessageSquare size={10} />
                    Add Feedback
                  </button>
                )}
              </div>
              
              {feedbackIndex === index && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3"
                >
                  <textarea
                    value={msg.feedback || ''}
                    onChange={(e) => handleFeedback(index, e.target.value)}
                    placeholder="How can I improve this derivation?"
                    className="w-full bg-black/40 border border-math-line rounded-sm p-2 text-[11px] font-mono focus:outline-none focus:border-math-accent transition-all resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button 
                      onClick={() => setFeedbackIndex(null)}
                      className="text-[9px] uppercase font-mono bg-math-accent/10 text-math-accent px-2 py-1 rounded-sm hover:bg-math-accent/20"
                    >
                      Submit
                    </button>
                  </div>
                </motion.div>
              )}
              
              {msg.feedback && feedbackIndex !== index && (
                <div className="mt-2 p-2 bg-math-accent/5 border-l-2 border-math-accent rounded-sm">
                  <p className="text-[10px] italic opacity-60">"{msg.feedback}"</p>
                </div>
              )}
            </div>
          )}
          
          {/* Message Actions */}
          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => toggleSaveMessage(index)}
              className={cn(
                "p-1 bg-zinc-900 border border-math-line rounded-sm hover:text-math-accent transition-all",
                msg.isSaved && "text-math-accent border-math-accent"
              )}
              title={msg.isSaved ? "Unsave" : "Save Solution"}
            >
              {msg.isSaved ? <BookmarkCheck size={12} /> : <Bookmark size={12} />}
            </button>
            <button
              onClick={() => copyMessage(msg.content, index)}
              className="p-1 bg-zinc-900 border border-math-line rounded-sm hover:text-math-accent transition-all"
              title="Copy Message"
            >
              {copiedId === index ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
        <span className="text-[9px] uppercase font-mono opacity-40">
          {msg.role === 'user' ? 'System Input' : 'Engine Output'} // {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
});

export function ChatInterface() {

  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('mathmind_history');
    return saved ? JSON.parse(saved) : [
      {
        role: 'model',
        content: "Welcome to **MathMind AI**. I am your **Intelligent AI Tutor**. \n\nI can guide you through complex mathematical derivations, provide multiple solution methods, and even help you practice with daily quizzes. \n\nHow can I assist your learning today?"
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'formulas' | 'saved' | 'quiz'>('history');
  const [feedbackIndex, setFeedbackIndex] = useState<number | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('environment');
  const [isScanMode, setIsScanMode] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem('mathmind_history', JSON.stringify(messages));
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input || (selectedImage ? "Analyze this mathematical content." : ""),
      image: selectedImage || undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setSelectedImage(null);
    setIsKeyboardOpen(false);
    setIsLoading(true);

    const history = [...messages, userMessage];
    const { text, graph, quiz } = await chatWithGemini(history);
    
    setMessages(prev => [...prev, { role: 'model', content: text, graph, quiz }]);
    setIsLoading(false);
  };

  const handleRate = useCallback((index: number, rating: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, rating } : msg
    ));
    setFeedbackIndex(index);
  }, []);

  const handleFeedback = useCallback((index: number, feedback: string) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, feedback } : msg
    ));
  }, []);

  const insertSymbol = useCallback((symbol: string) => {
    setInput(prev => prev + symbol);
  }, []);

  const exportToPDF = async () => {
    if (!chatContainerRef.current) return;
    const canvas = await html2canvas(chatContainerRef.current, {
      backgroundColor: '#050505',
      scale: 2,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`MathMind_Solution_${new Date().getTime()}.pdf`);
  };

  const toggleSaveMessage = (index: number) => {
    setMessages(prev => prev.map((msg, i) => 
      i === index ? { ...msg, isSaved: !msg.isSaved } : msg
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async (mode?: 'user' | 'environment') => {
    setIsCameraOpen(true);
    const facingMode = mode || cameraFacingMode;
    
    // Stop any existing stream before starting a new one
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: facingMode } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      // Fallback if environment camera is not available
      if (facingMode === 'environment') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (fallbackErr) {
          console.error("Camera fallback error:", fallbackErr);
          setIsCameraOpen(false);
        }
      } else {
        setIsCameraOpen(false);
      }
    }
  };

  const toggleCamera = () => {
    const newMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(newMode);
    startCamera(newMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setSelectedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const copyMessage = async (content: string, id: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'model',
        content: "Session reset. How can I help with your next mathematical challenge?"
      }
    ]);
    localStorage.removeItem('mathmind_history');
  };

  const savedMessages = messages.filter(m => m.isSaved);

  return (
    <div className="flex h-screen bg-math-bg overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        messages={messages}
        setInput={setInput}
        handleSubmit={handleSubmit}
        toggleSaveMessage={toggleSaveMessage}
        setMessages={setMessages}
      />

      <div className="flex-1 flex flex-col max-w-5xl mx-auto border-x border-math-line/20 relative">
        {/* Header */}
        <Header 
          setIsSidebarOpen={setIsSidebarOpen} 
          exportToPDF={exportToPDF} 
          clearChat={clearChat} 
        />

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-8 math-grid scroll-smooth"
        >
          <div ref={chatContainerRef} className="space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <MessageItem
                  key={i}
                  msg={msg}
                  index={i}
                  handleRate={handleRate}
                  handleFeedback={handleFeedback}
                  feedbackIndex={feedbackIndex}
                  setFeedbackIndex={setFeedbackIndex}
                  toggleSaveMessage={toggleSaveMessage}
                  copyMessage={copyMessage}
                  copiedId={copiedId}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {isLoading && (
            <LoadingIndicator />
          )}
        </div>

        {/* Input Area */}
        <InputArea 
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          isKeyboardOpen={isKeyboardOpen}
          setIsKeyboardOpen={setIsKeyboardOpen}
          insertSymbol={insertSymbol}
          fileInputRef={fileInputRef}
          handleImageUpload={handleImageUpload}
          startCamera={startCamera}
          startListening={startListening}
          setIsScanMode={setIsScanMode}
          isListening={isListening}
        />

        {/* Camera Modal */}
        <CameraModal 
          isOpen={isCameraOpen}
          isScanMode={isScanMode}
          cameraFacingMode={cameraFacingMode}
          videoRef={videoRef}
          canvasRef={canvasRef}
          toggleCamera={toggleCamera}
          stopCamera={stopCamera}
          setIsScanMode={setIsScanMode}
          capturePhoto={capturePhoto}
        />

        {/* Footer Meta */}
        <footer className="px-6 py-2 border-t border-math-line/10 bg-math-bg text-[8px] uppercase font-mono opacity-30 flex justify-between">
          <span>Status: Operational</span>
          <span>Precision: Double-64</span>
          <span>© 2026 MathMind Systems</span>
        </footer>
      </div>
    </div>
  );
}

// Sub-components
const Sidebar = memo(({ isOpen, setIsOpen, activeTab, setActiveTab, messages, setInput, handleSubmit, toggleSaveMessage, setMessages }: any) => {
  const savedMessages = messages.filter((m: any) => m.isSaved);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          exit={{ x: -300 }}
          className="w-80 bg-zinc-900 border-r border-math-line flex flex-col z-30"
        >
          <div className="p-6 border-b border-math-line flex items-center justify-between">
            <h2 className="font-mono font-bold text-xs uppercase tracking-widest">Knowledge Base</h2>
            <button onClick={() => setIsOpen(false)} className="text-math-ink/50 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="flex border-b border-math-line">
            {[
              { id: 'history', icon: <History size={14} />, label: 'History' },
              { id: 'formulas', icon: <Book size={14} />, label: 'Topics' },
              { id: 'quiz', icon: <GraduationCap size={14} />, label: 'Quiz' },
              { id: 'saved', icon: <Bookmark size={14} />, label: 'Saved' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex-1 py-3 flex flex-col items-center gap-1 text-[9px] uppercase font-mono transition-all",
                  activeTab === tab.id ? "text-math-accent border-b-2 border-math-accent bg-math-accent/5" : "text-math-ink/30 hover:text-math-ink/60"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeTab === 'formulas' && (
              <div className="space-y-6">
                {FORMULA_DATA.map((cat, i) => (
                  <div key={i}>
                    <h3 className="text-[10px] uppercase font-bold text-math-accent mb-3 tracking-widest">{cat.category}</h3>
                    <div className="space-y-3">
                      {cat.formulas.map((f, j) => (
                        <div key={j} className="p-3 bg-black/40 border border-math-line rounded-sm group hover:border-math-accent transition-all">
                          <p className="text-[11px] font-medium mb-2">{f.name}</p>
                          <MathRenderer content={`$${f.latex}$`} className="text-xs opacity-80" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'quiz' && (
              <div className="space-y-4">
                <div className="p-4 bg-math-accent/5 border border-math-accent/20 rounded-sm mb-6">
                  <p className="text-[11px] leading-relaxed opacity-70">
                    Select a topic to generate a practice quiz. I'll test your understanding with multiple-choice questions.
                  </p>
                </div>
                {[
                  "Calculus Fundamentals",
                  "Linear Algebra Basics",
                  "Differential Equations",
                  "Numerical Methods",
                  "Probability & Statistics"
                ].map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(`Generate a quiz about ${topic}`);
                      setTimeout(() => handleSubmit(), 0);
                      setIsOpen(false);
                    }}
                    className="w-full text-left p-3 bg-black/20 border border-math-line hover:border-math-accent rounded-sm transition-all group flex items-center justify-between"
                  >
                    <span className="text-[11px] font-mono uppercase">{topic}</span>
                    <ChevronRight size={14} className="opacity-30 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-2">
                {messages.filter((m: any) => m.role === 'user').map((m: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setInput(m.content)}
                    className="w-full text-left p-3 bg-black/20 border border-math-line hover:border-math-accent rounded-sm transition-all group"
                  >
                    <p className="text-[11px] line-clamp-2 opacity-60 group-hover:opacity-100">{m.content}</p>
                    <span className="text-[8px] uppercase font-mono opacity-30 mt-2 block">Entry #{messages.length - i}</span>
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'saved' && (
              <div className="space-y-4">
                {savedMessages.length === 0 ? (
                  <div className="text-center py-10 opacity-30">
                    <Bookmark size={24} className="mx-auto mb-2" />
                    <p className="text-[10px] uppercase font-mono">No saved solutions</p>
                  </div>
                ) : (
                  savedMessages.map((m: any, i: number) => (
                    <div key={i} className="p-3 bg-black/40 border border-math-line rounded-sm">
                      <MathRenderer content={m.content.substring(0, 100) + '...'} className="text-xs" />
                      
                      {m.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={8} 
                              className={m.rating! >= star ? "text-yellow-500" : "text-zinc-700"} 
                              fill={m.rating! >= star ? "currentColor" : "none"} 
                            />
                          ))}
                        </div>
                      )}

                      {m.feedback && (
                        <p className="text-[9px] italic opacity-40 mt-1 line-clamp-1">"{m.feedback}"</p>
                      )}

                      <button 
                        onClick={() => toggleSaveMessage(messages.indexOf(m))}
                        className="text-[9px] uppercase font-mono text-red-500 mt-2 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
});

const Header = memo(({ setIsSidebarOpen, exportToPDF, clearChat }: any) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-math-line bg-math-bg z-10">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-zinc-900 rounded-sm transition-colors text-math-ink/50 hover:text-math-accent"
        >
          <Menu size={20} />
        </button>
        <div className="p-2 bg-zinc-900 border border-math-line text-math-accent rounded-sm shadow-[var(--shadow-accent)]">
          <GraduationCap size={20} />
        </div>
        <div>
          <h1 className="font-mono font-bold text-sm tracking-tighter uppercase flex items-center gap-2">
            MathMind AI <Sparkles size={12} className="text-math-accent animate-pulse" />
          </h1>
          <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">Intelligent AI Tutor // v1.3</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={exportToPDF}
          className="p-2 hover:bg-zinc-900 border border-transparent hover:border-math-line transition-all rounded-sm group"
          title="Export to PDF"
        >
          <Download size={18} className="text-math-ink/50 group-hover:text-math-accent transition-all" />
        </button>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-zinc-900 border border-transparent hover:border-math-line transition-all rounded-sm group"
          title="Clear History"
        >
          <Trash2 size={18} className="text-math-ink/50 group-hover:text-red-500 transition-all" />
        </button>
      </div>
    </header>
  );
});

const LoadingIndicator = memo(() => (
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
));

const InputArea = memo(({ 
  input, setInput, isLoading, handleSubmit, selectedImage, setSelectedImage, 
  isKeyboardOpen, setIsKeyboardOpen, insertSymbol, fileInputRef, 
  handleImageUpload, startCamera, startListening, setIsScanMode, isListening
}: any) => {
  return (
    <div className="p-6 border-t border-math-line bg-black/80 backdrop-blur-md relative">
      <AnimatePresence>
        {isKeyboardOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-full left-6 right-6 mb-4 z-20"
          >
            <MathKeyboard onInsert={insertSymbol} />
          </motion.div>
        )}
      </AnimatePresence>

      {selectedImage && (
        <div className="mb-4 relative inline-block">
          <img src={selectedImage} alt="Selected" className="h-20 w-20 object-cover rounded-sm border border-math-accent" />
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}

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
        
        <div className="absolute right-12 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsKeyboardOpen(!isKeyboardOpen)}
            className={cn(
              "p-2 transition-colors",
              isKeyboardOpen ? "text-math-accent" : "text-math-ink/50 hover:text-math-accent"
            )}
            title="Math Keyboard"
          >
            <Keyboard size={18} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-math-ink/50 hover:text-math-accent transition-colors"
            title="Upload Image"
          >
            <ImageIcon size={18} />
          </button>
          <button
            type="button"
            onClick={() => startCamera()}
            className="p-2 text-math-ink/50 hover:text-math-accent transition-colors"
            title="Take Photo"
          >
            <Camera size={18} />
          </button>
          <button
            type="button"
            onClick={startListening}
            className={cn(
              "p-2 transition-colors",
              isListening ? "text-red-500 animate-pulse" : "text-math-ink/50 hover:text-math-accent"
            )}
            title="Voice Input"
          >
            <Mic size={18} />
          </button>
        </div>

        <button
          type="submit"
          disabled={(!input.trim() && !selectedImage) || isLoading}
          className="absolute right-2 p-2 bg-zinc-900 border border-math-line text-math-accent hover:bg-math-accent hover:text-white transition-all disabled:opacity-20 disabled:hover:bg-zinc-900"
        >
          <Send size={18} />
        </button>
      </form>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      
      {/* Quick Actions */}
      <div className="flex gap-4 mt-4 overflow-x-auto pb-2 no-scrollbar">
        {[
          { icon: <Camera size={12} />, label: "Scan Question", onClick: () => { setIsScanMode(true); startCamera(); } },
          { icon: <Calculator size={12} />, label: "Solve ODE", query: "Can you help me solve the second-order ODE: y'' + 2y' + 5y = sin(x)?" },
          { icon: <Book size={12} />, label: "Explain Fourier", query: "Explain the intuition behind Fourier Transforms in signal processing." },
          { icon: <Code size={12} />, label: "Python Model", query: "Write a Python script using SciPy to solve a system of linear equations." },
          { icon: <GraduationCap size={12} />, label: "Generate Quiz", query: "Generate a quiz about Calculus." },
        ].map((action, i) => (
          <button
            key={i}
            onClick={action.onClick || (() => { setInput(action.query || ''); setTimeout(() => handleSubmit(), 0); })}
            className="flex items-center gap-2 px-3 py-1.5 border border-math-line rounded-sm bg-zinc-900/50 hover:bg-math-accent hover:border-math-accent transition-all text-[10px] uppercase font-mono whitespace-nowrap text-math-ink/70 hover:text-white"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
});

const CameraModal = memo(({ isOpen, isScanMode, cameraFacingMode, videoRef, canvasRef, toggleCamera, stopCamera, setIsScanMode, capturePhoto }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        >
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-math-line rounded-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-math-line">
              <span className="font-mono text-xs uppercase tracking-widest text-math-accent">
                {isScanMode ? 'Math Scanner // Active' : `Camera Interface // ${cameraFacingMode === 'user' ? 'Front' : 'Back'}`}
              </span>
              <div className="flex items-center gap-4">
                {!isScanMode && (
                  <button 
                    onClick={toggleCamera}
                    className="text-math-ink/50 hover:text-math-accent transition-colors flex items-center gap-2 text-[10px] uppercase font-mono"
                  >
                    <RefreshCcw size={16} />
                    Switch
                  </button>
                )}
                <button onClick={() => { stopCamera(); setIsScanMode(false); }} className="text-math-ink/50 hover:text-white">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="relative aspect-video bg-black">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {isScanMode && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-10 border-2 border-math-accent/50 rounded-sm">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-math-accent" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-math-accent" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-math-accent" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-math-accent" />
                    
                    {/* Scanning Line */}
                    <motion.div 
                      className="absolute left-0 right-0 h-0.5 bg-math-accent shadow-[0_0_15px_rgba(0,255,157,0.8)]"
                      animate={{ 
                        top: ['0%', '100%', '0%'] 
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity, 
                        ease: "linear" 
                      }}
                    />
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <span className="bg-black/60 px-3 py-1 rounded-full text-[10px] uppercase font-mono text-math-accent tracking-widest backdrop-blur-sm">
                      Align question within frame
                    </span>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="p-6 flex justify-center flex-col items-center gap-4">
              <button 
                onClick={() => {
                  capturePhoto();
                  setIsScanMode(false);
                }}
                className={cn(
                  "w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all group",
                  isScanMode ? "border-math-accent/20 hover:border-math-accent" : "border-white/20 hover:border-math-accent"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-full transition-colors",
                  isScanMode ? "bg-math-accent animate-pulse" : "bg-white group-hover:bg-math-accent"
                )} />
              </button>
              {isScanMode && (
                <p className="text-[10px] uppercase font-mono opacity-40">Tap to capture and analyze</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
