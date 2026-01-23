import { TaskStatus } from '@/types/transfer';

interface SSEProgressData {
  uploadedBytes: number;
  totalBytes: number;
  uploadedChunks: number;
  totalChunks: number;
}

interface SSEStatusData {
  status: TaskStatus;
  message?: string;
}

interface SSECompleteData {
  fileId: string;
  fileName: string;
  fileSize: number;
}

interface SSEErrorData {
  code: string;
  message: string;
}

interface SSECallbacks {
  onProgress?: (taskId: string, data: SSEProgressData) => void;
  onStatus?: (taskId: string, data: SSEStatusData) => void;
  onComplete?: (taskId: string, data: SSECompleteData) => void;
  onError?: (taskId: string, data: SSEErrorData) => void;
}

class SSEService {
  private eventSource: EventSource | null = null;
  private callbacks: SSECallbacks = {};
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_BASE_DELAY = 2000;

  connect(userId: string, callbacks: SSECallbacks): void {
    if (this.eventSource) {
      this.disconnect();
    }

    this.callbacks = callbacks;
    const url = `${import.meta.env.VITE_API_BASE_URL}/apis/transfer/sse?userId=${encodeURIComponent(userId)}`;

    try {
      this.eventSource = new EventSource(url);
      this.setupEventListeners();
    } catch (error) {
      console.error('SSE connection failed:', error);
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.eventSource) return;

    this.eventSource.onopen = () => {
      this.reconnectAttempts = 0;
    };

    this.eventSource.onerror = () => {
      if (this.eventSource?.readyState === EventSource.CLOSED) {
        if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
          this.reconnectAttempts += 1;
          const delay = this.RECONNECT_BASE_DELAY * this.reconnectAttempts;
          setTimeout(() => {
            // Reconnect logic would go here
          }, delay);
        }
      }
    };

    this.eventSource.addEventListener('progress', (event) => {
      this.handleEvent('progress', event);
    });

    this.eventSource.addEventListener('status', (event) => {
      this.handleEvent('status', event);
    });

    this.eventSource.addEventListener('complete', (event) => {
      this.handleEvent('complete', event);
    });

    this.eventSource.addEventListener('error', (event) => {
      if (event instanceof MessageEvent) {
        this.handleEvent('error', event);
      }
    });
  }

  private handleEvent(type: string, event: Event): void {
    if (!(event instanceof MessageEvent)) return;

    try {
      const data = JSON.parse(event.data);
      const taskId = data.taskId;

      if (!taskId) return;

      switch (type) {
        case 'progress':
          this.callbacks.onProgress?.(taskId, data);
          break;
        case 'status':
          this.callbacks.onStatus?.(taskId, data);
          break;
        case 'complete':
          this.callbacks.onComplete?.(taskId, data);
          break;
        case 'error':
          this.callbacks.onError?.(taskId, data);
          break;
      }
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  }
}

export const sseService = new SSEService();
