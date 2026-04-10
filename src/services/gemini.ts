import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Message {
  role: 'user' | 'model';
  content: string;
}

const SYSTEM_PROMPT = `You are MathMind AI, an expert assistant specializing in Applied Mathematics. 
Your expertise includes:
- Calculus (Single and Multivariable)
- Linear Algebra and Matrix Theory
- Differential Equations (ODE and PDE)
- Numerical Analysis and Algorithms
- Probability and Statistics
- Mathematical Modeling (Physics, Engineering, Economics)
- Optimization and Control Theory
- Technical Computing (Python/NumPy/SciPy, MATLAB)

Guidelines:
1. Provide clear, step-by-step mathematical derivations.
2. Use LaTeX for all mathematical expressions (e.g., $x^2$ or $$\\int_0^\\infty e^{-x^2} dx$$).
3. When asked for code, provide efficient Python or MATLAB snippets using standard libraries.
4. Explain the physical or practical intuition behind mathematical concepts.
5. Be precise, rigorous, but accessible.
6. If a problem is ill-posed, ask for clarification.

Always format math using $...$ for inline and $$...$$ for block math.`;

export async function chatWithGemini(history: Message[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview", // Using pro for complex math
      contents: history.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Failed to connect to the mathematical engine.";
  }
}
