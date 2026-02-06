import type {
  SSEMessage,
  SSEMessageType,
  SSEProgressData,
  SSEStatusData,
  SSECompleteData,
  SSEErrorData,
} from '@/types/transfer'

export type SSEMessageHandler = (message: SSEMessage) => void
export type SSEConnectionHandler = (connected: boolean) => void

interface SSEServiceConfig {
  baseUrl: string
  endpoint: string
  syncOnReconnect: boolean
}

const DEFAULT_CONFIG: SSEServiceConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || '',
  endpoint: '/apis/transfer/sse',
  syncOnReconnect: true,
}

function parseProgressData(data: Record<string, unknown>): SSEProgressData {
  return {
    uploadedBytes: Number(data.uploadedBytes) || 0,
    totalBytes: Number(data.totalBytes) || 0,
    uploadedChunks: Number(data.uploadedChunks) || 0,
    totalChunks: Number(data.totalChunks) || 0,
  }
}

function parseStatusData(data: Record<string, unknown>): SSEStatusData {
  return {
    status: (data.status as string) || 'idle',
    message: data.message as string | undefined,
  } as SSEStatusData
}

function parseCompleteData(data: Record<string, unknown>): SSECompleteData {
  return {
    fileId: (data.fileId as string) || '',
    fileName: (data.fileName as string) || '',
    fileSize: Number(data.fileSize) || 0,
  }
}

function parseErrorData(data: Record<string, unknown>): SSEErrorData {
  return {
    code: (data.code as string) || 'UNKNOWN_ERROR',
    message: (data.message as string) || 'Unknown error occurred',
  }
}

class SSEService {
  private static instance: SSEService | null = null
  private eventSource: EventSource | null = null
  private currentUserId: string | null = null
  private messageHandlers: Set<SSEMessageHandler> = new Set()
  private connectionHandlers: Set<SSEConnectionHandler> = new Set()
  private config: SSEServiceConfig
  private connected = false
  private onReconnectSync: (() => Promise<void>) | null = null
  private reconnectAttempts = 0
  private readonly MAX_RECONNECT_ATTEMPTS = 5
  private readonly RECONNECT_BASE_DELAY = 2000

  private constructor(config: Partial<SSEServiceConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  public static getInstance(config?: Partial<SSEServiceConfig>): SSEService {
    if (!SSEService.instance) {
      SSEService.instance = new SSEService(config)
    }
    return SSEService.instance
  }

  public connect(userId: string): void {
    if (this.eventSource && this.currentUserId === userId) {
      return
    }

    if (this.eventSource) {
      this.disconnect()
    }

    this.currentUserId = userId

    const url = `${this.config.baseUrl}${this.config.endpoint}?userId=${encodeURIComponent(userId)}`

    try {
      this.eventSource = new EventSource(url)
      this.setupEventListeners()
    } catch (error) {
      console.error('SSE 连接失败:', error)
      this.setConnected(false)
    }
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      this.currentUserId = null
      this.setConnected(false)
    }
  }

  public isConnected(): boolean {
    return this.connected
  }

  public onMessage(handler: SSEMessageHandler): () => void {
    this.messageHandlers.add(handler)
    return () => {
      this.messageHandlers.delete(handler)
    }
  }

  public onConnectionChange(handler: SSEConnectionHandler): () => void {
    this.connectionHandlers.add(handler)
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  public setReconnectSyncCallback(callback: () => Promise<void>): void {
    this.onReconnectSync = callback
  }

  private setConnected(connected: boolean): void {
    const wasConnected = this.connected
    this.connected = connected

    this.connectionHandlers.forEach((handler) => {
      try {
        handler(connected)
      } catch {
        // Silent
      }
    })

    if (!wasConnected && connected && this.config.syncOnReconnect) {
      this.triggerReconnectSync()
    }
  }

  private async triggerReconnectSync(): Promise<void> {
    if (this.onReconnectSync) {
      try {
        await this.onReconnectSync()
      } catch {
        // Silent
      }
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0
      this.setConnected(true)
    }

    this.eventSource.onerror = (error) => {
      console.error('SSE 连接错误:', error)

      if (this.eventSource?.readyState === EventSource.CLOSED) {
        this.setConnected(false)

        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts += 1
          const delay = this.RECONNECT_BASE_DELAY * this.reconnectAttempts

          setTimeout(() => {
            if (this.currentUserId) {
              this.connect(this.currentUserId)
            }
          }, delay)
        }
      }
    }

    this.eventSource.addEventListener('progress', (event) => {
      this.handleEvent('progress', event)
    })

    this.eventSource.addEventListener('status', (event) => {
      this.handleEvent('status', event)
    })

    this.eventSource.addEventListener('complete', (event) => {
      this.handleEvent('complete', event)
    })

    this.eventSource.addEventListener('error', (event) => {
      if (event instanceof MessageEvent) {
        this.handleEvent('error', event)
      }
    })

    this.eventSource.onmessage = (event) => {
      this.handleGenericMessage(event)
    }
  }

  private handleEvent(type: SSEMessageType, event: Event): void {
    if (!(event instanceof MessageEvent)) return

    try {
      const rawData = JSON.parse(event.data)
      const message = this.parseMessage(type, rawData)

      if (message) {
        this.dispatchMessage(message)
      }
    } catch {
      // Silent
    }
  }

  private handleGenericMessage(event: MessageEvent): void {
    try {
      const rawData = JSON.parse(event.data)

      if (rawData.type && rawData.taskId) {
        const message = this.parseMessage(rawData.type, rawData)
        if (message) {
          this.dispatchMessage(message)
        }
      }
    } catch {
      // Silent
    }
  }

  private parseMessage(
    type: SSEMessageType,
    rawData: Record<string, unknown>
  ): SSEMessage | null {
    const taskId = rawData.taskId as string
    if (!taskId) return null

    const data = (rawData.data as Record<string, unknown>) || rawData

    switch (type) {
      case 'progress':
        return { type: 'progress', taskId, data: parseProgressData(data) }
      case 'status':
        return { type: 'status', taskId, data: parseStatusData(data) }
      case 'complete':
        return { type: 'complete', taskId, data: parseCompleteData(data) }
      case 'error':
        return { type: 'error', taskId, data: parseErrorData(data) }
      default:
        return null
    }
  }

  private dispatchMessage(message: SSEMessage): void {
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message)
      } catch {
        // Silent
      }
    })
  }
}

export const sseService = SSEService.getInstance()
export { SSEService }
