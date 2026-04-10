export const FORMULA_DATA = [
  {
    category: "Calculus",
    formulas: [
      { name: "Power Rule", latex: "\\frac{d}{dx}x^n = nx^{n-1}" },
      { name: "Product Rule", latex: "\\frac{d}{dx}(uv) = u\\frac{dv}{dx} + v\\frac{du}{dx}" },
      { name: "Chain Rule", latex: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}" },
      { name: "Integration by Parts", latex: "\\int u \\, dv = uv - \\int v \\, du" },
      { name: "Fundamental Theorem", latex: "\\int_a^b f(x)dx = F(b) - F(a)" },
      { name: "Taylor Series", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n" }
    ]
  },
  {
    category: "Linear Algebra",
    formulas: [
      { name: "Determinant (2x2)", latex: "\\det\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} = ad - bc" },
      { name: "Eigenvalue Equation", latex: "A\\mathbf{v} = \\lambda\\mathbf{v}" },
      { name: "Matrix Inverse", latex: "A^{-1} = \\frac{1}{\\det(A)} \\text{adj}(A)" },
      { name: "Dot Product", latex: "\\mathbf{a} \\cdot \\mathbf{b} = \\sum a_i b_i = |\\mathbf{a}||\\mathbf{b}|\\cos\\theta" },
      { name: "Cross Product", latex: "|\\mathbf{a} \\times \\mathbf{b}| = |\\mathbf{a}||\\mathbf{b}|\\sin\\theta" }
    ]
  },
  {
    category: "Differential Equations",
    formulas: [
      { name: "1st Order Linear", latex: "y' + P(x)y = Q(x)" },
      { name: "Integrating Factor", latex: "\\mu(x) = e^{\\int P(x)dx}" },
      { name: "Laplace Transform", latex: "\\mathcal{L}\\{f(t)\\} = \\int_0^{\\infty} e^{-st}f(t)dt" },
      { name: "Fourier Transform", latex: "\\hat{f}(\\xi) = \\int_{-\\infty}^{\\infty} f(x)e^{-2\\pi i x \\xi}dx" }
    ]
  },
  {
    category: "Numerical Methods",
    formulas: [
      { name: "Newton-Raphson", latex: "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}" },
      { name: "Euler's Method", latex: "y_{n+1} = y_n + h f(x_n, y_n)" },
      { name: "Runge-Kutta (RK4)", latex: "y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)" },
      { name: "Simpson's Rule", latex: "\\int_a^b f(x)dx \\approx \\frac{h}{3}[f(x_0) + 4f(x_1) + f(x_2)]" }
    ]
  },
  {
    category: "Statistics & Prob",
    formulas: [
      { name: "Standard Deviation", latex: "\\sigma = \\sqrt{\\frac{\\sum(x_i - \\mu)^2}{N}}" },
      { name: "Normal Distribution", latex: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{1}{2}(\\frac{x-\\mu}{\\sigma})^2}" },
      { name: "Bayes' Theorem", latex: "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}" },
      { name: "Expected Value", latex: "E[X] = \\sum x_i P(x_i)" }
    ]
  },
  {
    category: "Trigonometry",
    formulas: [
      { name: "Pythagorean Identity", latex: "\\sin^2\\theta + \\cos^2\\theta = 1" },
      { name: "Euler's Formula", latex: "e^{i\\theta} = \\cos\\theta + i\\sin\\theta" },
      { name: "Law of Cosines", latex: "c^2 = a^2 + b^2 - 2ab\\cos C" }
    ]
  }
];
