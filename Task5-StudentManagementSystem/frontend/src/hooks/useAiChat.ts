import { useState, useEffect, useCallback } from 'react'
import { aiProvider } from '../services/ai/AIProvider'
import { apiClient } from '../services/apiClient'
import type { ChatMessage } from '../types/ai'

const updateMessageChunk = (
  prev: ChatMessage[],
  targetId: string,
  chunk: string,
  providerName?: string,
  modelName?: string
): ChatMessage[] => {
  return prev.map(m =>
    m.id === targetId
      ? {
          ...m,
          text: m.text + chunk,
          providerName: providerName || m.providerName,
          modelName: modelName || m.modelName
        }
      : m
  )
}

export const useAiChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('eduvault_chat_messages')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map((m: any) => ({
          id: m.id || `${m.role || m.sender}-${Date.now()}-${Math.random()}`,
          sender: m.role || m.sender,
          text: m.message || m.text,
          timestamp: new Date(m.timestamp),
          providerName: m.providerName,
          modelName: m.modelName
        }))
      } catch {
        return []
      }
    }
    return []
  })
  
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Persist messages
  useEffect(() => {
    const toSave = messages.map(m => ({
      role: m.sender,
      message: m.text,
      timestamp: m.timestamp,
      providerName: m.providerName,
      modelName: m.modelName
    }))
    localStorage.setItem('eduvault_chat_messages', JSON.stringify(toSave))
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return

    setError(null)
    setLoading(true)
    setIsTyping(true)

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date()
    }

    // Capture history *before* updating messages state
    const currentMessages = [...messages]

    setMessages(prev => [...prev, userMsg])

    const aiMsgId = `ai-${Date.now()}`
    const aiMsgPlaceholder: ChatMessage = {
      id: aiMsgId,
      sender: 'ai',
      text: '',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, aiMsgPlaceholder])

    try {
      // Fetch system prompt dynamically from backend
      const promptRes = await apiClient.get<{ prompt: string }>('/ai/copilot-prompt')
      const systemInstruction = promptRes.data.prompt

      // Format conversation history
      const historyBlock = currentMessages
        .slice(-6)
        .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
        .join('\n')

      const finalPrompt = historyBlock ? `${historyBlock}\nUser: ${text}` : text
      
      // Attempt generation using failover provider chain
      await aiProvider.generateStream(
        finalPrompt,
        systemInstruction,
        (chunk, providerName, modelName) => {
          setMessages(prev => updateMessageChunk(prev, aiMsgId, chunk, providerName, modelName))
          setIsTyping(false)
        }
      )
    } catch (err: any) {
      console.error('[useAiChat] Chat error:', err)
      setError(err.message || 'An error occurred during generation.')
      setMessages(prev =>
        prev.map(m =>
          m.id === aiMsgId
            ? {
                ...m,
                text: 'Sorry, I encountered an error attempting to process this request. Please try again.',
                isError: true
              }
            : m
        )
      )
    } finally {
      setLoading(false)
      setIsTyping(false)
    }
  }, [messages])

  const retryMessage = useCallback(async (messageId: string) => {
    // Find the user message preceding the failed AI message
    const msgIndex = messages.findIndex(m => m.id === messageId)
    if (msgIndex === -1) return

    // Find the closest user message before the failed AI message
    let userMsgText = ''
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        userMsgText = messages[i].text
        break
      }
    }

    if (!userMsgText) return

    // Remove the failed AI message and all subsequent messages
    setMessages(prev => prev.slice(0, msgIndex))

    // Re-send the user message text
    await sendMessage(userMsgText)
  }, [messages, sendMessage])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
    localStorage.removeItem('eduvault_chat_messages')
  }, [])

  return {
    messages,
    loading,
    isTyping,
    error,
    sendMessage,
    retryMessage,
    clearChat
  }
}
