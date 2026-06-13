import type { AIProvider } from '../../types/ai'

export class GeminiProvider implements AIProvider {
  readonly name: string
  readonly rawProviderName: string = 'Gemini'
  readonly modelName: string
  private readonly apiKey: string

  constructor(apiKey: string, model: string, name = 'Gemini') {
    this.apiKey = apiKey
    this.modelName = model
    this.name = `${name} (${model})`
  }

  private parseLine(
    line: string,
    onChunk: (chunk: string, providerName: string, modelName: string) => void
  ): string {
    let clean = line.trim()
    if (clean.startsWith('[')) clean = clean.substring(1).trim()
    if (clean.startsWith(',')) clean = clean.substring(1).trim()
    if (clean.endsWith(']')) clean = clean.substring(0, clean.length - 1).trim()
    if (!clean) return ''

    try {
      const parsed = JSON.parse(clean)
      const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (text) {
        onChunk(text, this.rawProviderName, this.modelName)
        return text
      }
    } catch {
      throw new Error('Incomplete JSON')
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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:streamGenerateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          systemInstruction: systemInstruction
            ? { parts: [{ text: systemInstruction }] }
            : undefined,
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text().catch(() => '')
      throw new Error(`Gemini API error (${response.status}): ${errText || response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Gemini response body is not readable')
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
          try {
            const text = this.parseLine(line, onChunk)
            fullText += text
          } catch {
            // Keep split/partial JSON chunks for the next buffer cycle
            buffer = line.trim() + '\n' + buffer
          }
        }
      }

      if (buffer.trim()) {
        try {
          const text = this.parseLine(buffer, onChunk)
          fullText += text
        } catch {
          // ignore final malformed chunk if any
        }
      }
    } finally {
      reader.releaseLock()
    }

    return fullText
  }
}
