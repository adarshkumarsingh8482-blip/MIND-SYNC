import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { cn } from '@/src/lib/utils';

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className }: MathRendererProps) {
  return (
    <div className={cn("prose prose-sm max-w-none prose-invert prose-p:text-math-ink prose-headings:text-math-ink prose-strong:text-math-accent", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            return (
              <code
                className={cn(
                  "bg-white/10 px-1.5 py-0.5 rounded font-mono text-xs text-math-accent",
                  !inline && "block p-4 my-4 overflow-x-auto bg-zinc-900 border border-math-line text-math-ink",
                  className
                )}
                {...props}
              >
                {children}
              </code>
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
