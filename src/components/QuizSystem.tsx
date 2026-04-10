import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, ArrowRight, RotateCcw, Trophy } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuizProps {
  topic: string;
  questions: Question[];
  onComplete?: (score: number) => void;
}

export function QuizSystem({ topic, questions, onComplete }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);
    if (option === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      onComplete?.(score);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className="p-6 bg-zinc-900 border border-math-line rounded-sm text-center">
        <Trophy size={48} className="mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-mono font-bold uppercase mb-2">Quiz Complete</h3>
        <p className="text-math-accent text-2xl font-bold mb-4">{score} / {questions.length}</p>
        <p className="text-xs opacity-60 mb-6">Topic: {topic}</p>
        <button 
          onClick={resetQuiz}
          className="flex items-center gap-2 px-4 py-2 bg-math-accent text-white rounded-sm mx-auto hover:bg-math-accent/80 transition-all font-mono text-xs uppercase"
        >
          <RotateCcw size={14} />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-zinc-900 border border-math-line rounded-sm">
      <div className="flex justify-between items-center mb-6">
        <span className="text-[10px] uppercase font-mono text-math-accent tracking-widest">Practice Quiz // {topic}</span>
        <span className="text-[10px] font-mono opacity-40">Q {currentIndex + 1} of {questions.length}</span>
      </div>

      <h3 className="text-sm font-medium mb-6 leading-relaxed">{currentQuestion.question}</h3>

      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={isAnswered}
            className={cn(
              "w-full text-left p-4 border rounded-sm transition-all text-sm",
              !isAnswered && "border-math-line hover:border-math-accent bg-black/20",
              isAnswered && opt === currentQuestion.correctAnswer && "border-green-500 bg-green-500/10 text-green-500",
              isAnswered && selectedOption === opt && opt !== currentQuestion.correctAnswer && "border-red-500 bg-red-500/10 text-red-500",
              isAnswered && opt !== currentQuestion.correctAnswer && selectedOption !== opt && "border-math-line opacity-30"
            )}
          >
            <div className="flex items-center justify-between">
              <span>{opt}</span>
              {isAnswered && opt === currentQuestion.correctAnswer && <Check size={16} />}
              {isAnswered && selectedOption === opt && opt !== currentQuestion.correctAnswer && <X size={16} />}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-math-accent/5 border-l-2 border-math-accent rounded-sm"
          >
            <p className="text-xs leading-relaxed opacity-80">
              <span className="font-bold text-math-accent uppercase mr-2">Explanation:</span>
              {currentQuestion.explanation}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {isAnswered && (
        <button
          onClick={nextQuestion}
          className="w-full flex items-center justify-center gap-2 py-3 bg-math-accent text-white rounded-sm hover:bg-math-accent/80 transition-all font-mono text-xs uppercase"
        >
          {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
