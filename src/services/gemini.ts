import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export interface Message {
  role: 'user' | 'model';
  content: string;
  image?: string; // Base64 string
  graph?: any;
  quiz?: any;
  isSaved?: boolean;
  rating?: number;
  feedback?: string;
}

const plotFunctionTool: FunctionDeclaration = {
  name: "plot_function",
  description: "Generate a graph for a mathematical function or dataset.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ["line", "scatter"],
        description: "The type of plot to generate."
      },
      title: {
        type: Type.STRING,
        description: "The title of the graph."
      },
      xAxis: {
        type: Type.STRING,
        description: "Label for the X-axis."
      },
      yAxis: {
        type: Type.STRING,
        description: "Label for the Y-axis."
      },
      data: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          description: "Data points for the graph."
        }
      }
    },
    required: ["type", "title", "xAxis", "yAxis", "data"]
  }
};

const generateQuizTool: FunctionDeclaration = {
  name: "generate_quiz",
  description: "Generate a mathematical quiz for practice.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING, description: "The math topic for the quiz." },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    },
    required: ["topic", "questions"]
  }
};

const SYSTEM_PROMPT = `You are MathMind AI, an Intelligent AI Tutor specializing in Applied Mathematics. 

Core Philosophies:
1. **Tutoring Mode**: Instead of just giving answers, guide the user through the logic. Ask Socratic questions when appropriate.
2. **Multiple Solution Methods**: Whenever possible, provide at least two different ways to solve a problem (e.g., Algebraic vs. Geometric, Numerical vs. Analytical).
3. **Handwriting Recognition**: You are an expert at identifying and transcribing handwritten mathematical equations from images. Be precise with indices, exponents, and Greek letters.
4. **Topic-Wise Mastery**: Organize complex explanations by topic.

Guidelines:
- Provide clear, step-by-step mathematical derivations.
- Use LaTeX for all mathematical expressions (e.g., $x^2$ or $$\\int_0^\\infty e^{-x^2} dx$$).
- When asked for code, provide efficient Python or MATLAB snippets.
- Use the 'plot_function' tool to visualize functions or data.
- Use the 'generate_quiz' tool when the user wants to practice or take a quiz.

Always format math using $...$ for inline and $$...$$ for block math.`;

export async function chatWithGemini(history: Message[]) {
  if (!apiKey) {
    return { 
      text: "Configuration Error: GEMINI_API_KEY is missing. Please ensure the environment variable is set in your deployment platform (e.g., Vercel).", 
      graph: null, 
      quiz: null 
    };
  }

  try {
    const contents = history.map(m => {
      const parts: any[] = [{ text: m.content }];
      if (m.image) {
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: m.image.split(',')[1]
          }
        });
      }
      return {
        role: m.role,
        parts
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.7,
        tools: [{ functionDeclarations: [plotFunctionTool, generateQuizTool] }],
      },
    });

    const text = response.text || "";
    const functionCalls = response.functionCalls;

    let graph = null;
    let quiz = null;

    if (functionCalls) {
      const plotCall = functionCalls.find(c => c.name === 'plot_function');
      const quizCall = functionCalls.find(c => c.name === 'generate_quiz');
      if (plotCall) graph = plotCall.args;
      if (quizCall) quiz = quizCall.args;
    }

    return { text, graph, quiz };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "Error: Failed to connect to the mathematical engine.";
    
    if (error?.message?.includes("API_KEY_INVALID")) {
      errorMessage = "Error: Invalid API Key. Please check your GEMINI_API_KEY configuration.";
    } else if (error?.message?.includes("location is not supported")) {
      errorMessage = "Error: The Gemini API is not supported in your current region.";
    } else if (error?.message?.includes("quota")) {
      errorMessage = "Error: API quota exceeded. Please try again later.";
    }
    
    return { text: errorMessage, graph: null, quiz: null };
  }
}
