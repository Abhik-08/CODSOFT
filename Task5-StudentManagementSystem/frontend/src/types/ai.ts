export interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  timestamp: Date
  isError?: boolean
  providerName?: string
  modelName?: string
}

export interface AIProvider {
  readonly name: string
  readonly rawProviderName: string
  readonly modelName: string
  generateStream(
    prompt: string,
    systemInstruction: string,
    onChunk: (chunk: string, providerName: string, modelName: string) => void
  ): Promise<string>
}

export interface AIProviderConfig {
  apiKey: string
  primaryModel: string
  fallbackModel: string
}

