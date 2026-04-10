import { cn } from '@/src/lib/utils';

interface MathKeyboardProps {
  onInsert: (symbol: string) => void;
  className?: string;
}

const SYMBOLS = [
  { label: 'π', value: 'π' },
  { label: 'θ', value: 'θ' },
  { label: '√', value: '√' },
  { label: '∫', value: '∫' },
  { label: 'Σ', value: 'Σ' },
  { label: '∞', value: '∞' },
  { label: '∂', value: '∂' },
  { label: '∆', value: '∆' },
  { label: 'λ', value: 'λ' },
  { label: 'α', value: 'α' },
  { label: 'β', value: 'β' },
  { label: 'γ', value: 'γ' },
  { label: '±', value: '±' },
  { label: '≠', value: '≠' },
  { label: '≈', value: '≈' },
  { label: '≤', value: '≤' },
  { label: '≥', value: '≥' },
  { label: '→', value: '→' },
  { label: '⇒', value: '⇒' },
  { label: '⇔', value: '⇔' },
  { label: '∈', value: '∈' },
  { label: '⊂', value: '⊂' },
  { label: '∪', value: '∪' },
  { label: '∩', value: '∩' },
  { label: '^2', value: '^2' },
  { label: '^n', value: '^n' },
  { label: '_i', value: '_i' },
  { label: 'sin', value: 'sin(' },
  { label: 'cos', value: 'cos(' },
  { label: 'tan', value: 'tan(' },
  { label: 'log', value: 'log(' },
  { label: 'ln', value: 'ln(' },
];

export function MathKeyboard({ onInsert, className }: MathKeyboardProps) {
  return (
    <div className={cn("grid grid-cols-8 gap-1 p-2 bg-zinc-900 border border-math-line rounded-sm shadow-xl", className)}>
      {SYMBOLS.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={() => onInsert(s.value)}
          className="h-8 flex items-center justify-center bg-black/40 border border-math-line hover:border-math-accent hover:text-math-accent rounded-sm text-xs font-mono transition-all"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
