import { GeminiProvider } from './GeminiProvider'
import { GroqProvider } from './GroqProvider'
import { aiConfig } from '../../config/aiConfig'
import type { AIProvider } from '../../types/ai'

export class AIModelRouter {
  private providers: AIProvider[] = []
  private readonly failedProviders: Set<string> = new Set()
  private preferredProvider: string

  constructor() {
    this.preferredProvider = aiConfig.preferredProvider
    this.initializeProviders()
  }

  private initializeProviders() {
    const { gemini, groq } = aiConfig

    const geminiPrimary = gemini.apiKey ? new GeminiProvider(gemini.apiKey, gemini.primaryModel, 'Gemini Flash') : null
    const geminiFallback = gemini.apiKey ? new GeminiProvider(gemini.apiKey, gemini.fallbackModel, 'Gemini Flash Lite') : null
    const geminiAdvanced = gemini.apiKey ? new GeminiProvider(gemini.apiKey, gemini.advancedModel, 'Gemini Pro') : null

    const groqPrimary = groq.apiKey ? new GroqProvider(groq.apiKey, groq.primaryModel, 'Groq Llama 70B') : null
    const groqFallback = groq.apiKey ? new GroqProvider(groq.apiKey, groq.fallbackModel, 'Groq DeepSeek R1') : null
    const groqReasoning = groq.apiKey ? new GroqProvider(groq.apiKey, groq.reasoningModel, 'Groq Qwen QWQ') : null
    const groqLight = groq.apiKey ? new GroqProvider(groq.apiKey, groq.lightModel, 'Groq Llama 8B') : null

    const geminiChain = [geminiPrimary, geminiFallback, geminiAdvanced].filter((p): p is GeminiProvider => p !== null)
    const groqChain = [groqPrimary, groqFallback, groqReasoning, groqLight].filter((p): p is GroqProvider => p !== null)

    const activeList: AIProvider[] = []

    if (this.preferredProvider === 'groq') {
      activeList.push(...groqChain, ...geminiChain)
    } else if (this.preferredProvider === 'gemini') {
      activeList.push(...geminiChain, ...groqChain)
    } else {
      // Default: auto / routing logic priority
      activeList.push(...geminiChain, ...groqChain)
    }

    this.providers = activeList
  }

  getPrimaryModel(): AIProvider | null {
    return this.providers.find(p => !this.failedProviders.has(p.name)) || null
  }

  getFallbackModel(): AIProvider | null {
    const working = this.providers.filter(p => !this.failedProviders.has(p.name))
    return working.length > 1 ? working[1] : null
  }

  switchProvider(provider: 'gemini' | 'groq' | 'auto') {
    this.preferredProvider = provider
    this.failedProviders.clear()
    this.initializeProviders()
  }

  recordFailure(provider: AIProvider, error: Error) {
    console.warn(`[AIModelRouter] Recording failure for: ${provider.name}. Error: ${error.message}`)
    this.failedProviders.add(provider.name)
  }

  resetFailures() {
    this.failedProviders.clear()
  }

  getProvidersChain(): AIProvider[] {
    return this.providers.filter(p => !this.failedProviders.has(p.name))
  }
}
