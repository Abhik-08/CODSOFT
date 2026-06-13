import type { AIProvider } from '../../types/ai'

export class GroqProvider implements AIProvider {
  readonly name: string
  readonly rawProviderName: string = 'Groq'
  readonly modelName: string
  private readonly apiKey: string

  constructor(apiKey: string, model: string, name = 'Groq') {
    this.apiKey = apiKey
    this.modelName = model
    this.name = `${name} (${model})`
  }

  private parseLine(
    line: string,
    onChunk: (chunk: string, providerName: string, modelName: string) => void
  ): string {
    const clean = line.trim()
    if (clean === 'data: [DONE]' || !clean.startsWith('data: ')) return ''

    try {
      const parsed = JSON.parse(clean.substring(6))
      const text = parsed.choices?.[0]?.delta?.content || ''
      if (text) {
        onChunk(text, this.rawProviderName, this.modelName)
        return text
      }
    } catch {
      // ignore JSON parsing error
    }
    return ''
  }

  async generateStream(
    prompt: string,
    systemInstruction: string,
    onChunk: (chunk: string, providerName: string, modelName: string) => void
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error(`API key for ${this.name} is missing.`)
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.modelName,
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
        stream: true
      })
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`Groq API error (${response.status}): ${errText || response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Groq response body is not readable')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    let fullText = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const text = this.parseLine(line, onChunk)
          fullText += text
        }
      }

      if (buffer.trim()) {
        const text = this.parseLine(buffer, onChunk)
        fullText += text
      }
    } finally {
      reader.releaseLock()
    }

    return fullText
  }
}
