import { AIModelRouter } from './AIModelRouter'
import type { AIProvider } from '../../types/ai'

export class AIProviderManager implements AIProvider {
  readonly name = 'AI Provider Manager'
  readonly rawProviderName = 'AI Router'
  readonly modelName = 'Auto'
  private readonly router: AIModelRouter

  private static requestsCount = 0
  private static cumulativeFailovers = 0

  constructor() {
    this.router = new AIModelRouter()
  }

  getRouter(): AIModelRouter {
    return this.router
  }

  async generateStream(
    prompt: string,
    systemInstruction: string,
    onChunk: (chunk: string, providerName: string, modelName: string) => void
  ): Promise<string> {
    const startTime = performance.now()
    let requestFailovers = 0

    while (true) {
      const activeProvider = this.router.getPrimaryModel()
      if (!activeProvider) {
        AIProviderManager.requestsCount++
        AIProviderManager.cumulativeFailovers += requestFailovers
        const responseTime = Math.round(performance.now() - startTime)

        console.info('[AI Analytics] Request failed across all providers.', {
          totalRequests: AIProviderManager.requestsCount,
          responseTimeMs: responseTime,
          failoversForThisRequest: requestFailovers,
          cumulativeFailovers: AIProviderManager.cumulativeFailovers
        })

        throw new Error('All AI providers in the failover chain failed or none are configured.')
      }

      try {
        console.log(`[AIProviderManager] Attempting generation with: ${activeProvider.name}`)
        const result = await activeProvider.generateStream(prompt, systemInstruction, onChunk)

        const responseTime = Math.round(performance.now() - startTime)
        AIProviderManager.requestsCount++
        AIProviderManager.cumulativeFailovers += requestFailovers

        console.info('[AI Analytics] Request completed successfully.', {
          totalRequests: AIProviderManager.requestsCount,
          providerUsed: activeProvider.rawProviderName,
          modelUsed: activeProvider.modelName,
          responseTimeMs: responseTime,
          failoversForThisRequest: requestFailovers,
          cumulativeFailovers: AIProviderManager.cumulativeFailovers
        })

        this.router.resetFailures()
        return result
      } catch (err: any) {
        console.warn(`[AIProviderManager] ${activeProvider.name} failed:`, err)
        this.router.recordFailure(activeProvider, err)
        requestFailovers++
      }
    }
  }
}

export const aiProvider = new AIProviderManager()
