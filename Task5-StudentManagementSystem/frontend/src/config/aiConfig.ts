export interface GeminiConfig {
  primaryModel: string
  fallbackModel: string
  advancedModel: string
}

export interface GroqConfig {
  primaryModel: string
  fallbackModel: string
  lightModel: string
  reasoningModel: string
}

export interface AIConfig {
  preferredProvider: string
  gemini: GeminiConfig
  groq: GroqConfig
}

export const aiConfig: AIConfig = {
  preferredProvider: (import.meta.env.VITE_AI_PROVIDER as string || 'auto').toLowerCase(),
  gemini: {
    primaryModel: import.meta.env.VITE_GEMINI_PRIMARY_MODEL as string || 'gemini-2.5-flash',
    fallbackModel: import.meta.env.VITE_GEMINI_FALLBACK_MODEL as string || 'gemini-2.5-flash-lite',
    advancedModel: import.meta.env.VITE_GEMINI_ADVANCED_MODEL as string || 'gemini-2.5-pro',
  },
  groq: {
    primaryModel: import.meta.env.VITE_GROQ_PRIMARY_MODEL as string || 'llama-3.3-70b-versatile',
    fallbackModel: import.meta.env.VITE_GROQ_FALLBACK_MODEL as string || 'deepseek-r1-distill-llama-70b',
    lightModel: import.meta.env.VITE_GROQ_LIGHT_MODEL as string || 'llama-3.1-8b-instant',
    reasoningModel: import.meta.env.VITE_GROQ_REASONING_MODEL as string || 'qwen-qwq-32b',
  }
}
