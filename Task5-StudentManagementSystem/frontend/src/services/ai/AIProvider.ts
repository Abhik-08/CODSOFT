import { apiClient } from '../apiClient'
import type { AIProvider } from '../../types/ai'

interface GatewayResponse {
  reply: string
  provider: string
  model: string
  responseTime: number
  tokensUsed: number
}

export class AIProviderManager implements AIProvider {
  readonly name = 'AI Gateway Client'
  readonly rawProviderName = 'AI Gateway'
  readonly modelName = 'Auto'

  async generateStream(
    prompt: string,
    _systemInstruction: string,
    onChunk: (chunk: string, providerName: string, modelName: string) => void
  ): Promise<string> {
    const res = await apiClient.post<GatewayResponse>('/ai/chat', {
      message: prompt
    })

    const data = res.data
    
    // Call the chunk callback once with the full mapped response.
    // This maintains compatibility with the existing streaming-ready chat UI.
    onChunk(data.reply, data.provider, data.model)
    return data.reply
  }
}

export const aiProvider = new AIProviderManager()
