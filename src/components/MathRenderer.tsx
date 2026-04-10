import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/src/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MathRendererProps {
  content: string;
  className?: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-sm bg-zinc-800 border border-math-line text-math-ink/50 hover:text-math-accent hover:border-math-accent transition-all z-10"
      title="Copy code"
    >
      {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
    </button>
  );
}

export function MathRenderer({ content, className }: MathRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none prose-invert prose-p:text-math-ink prose-headings:text-math-ink prose-strong:text-math-accent", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const codeString = String(children).replace(/\n$/, '');
            if (inline) {
              return (
                <code
                  className={cn(
                    "bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-math-accent",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="relative group my-4">
                <CopyButton text={codeString} />
                <code
                  className={cn(
                    "block p-4 overflow-x-auto bg-zinc-900 border border-math-line text-math-ink rounded-sm font-mono text-xs",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              </div>
            );
          },
          p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-4 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-4 space-y-1">{children}</ol>,
          h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6 border-b border-math-line/20 pb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-bold mb-3 mt-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-md font-bold mb-2 mt-4">{children}</h3>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
