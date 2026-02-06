/**
 * 进度计算器 - 负责平滑计算和展示上传进度、速度、剩余时间
 */

interface SpeedSample {
  timestamp: number
  bytes: number
}

interface TaskProgressData {
  uploadedBytes: number
  totalBytes: number
  lastProgress: number
  lastUpdateTime: number
  speedCalculator: SlidingWindowSpeed
}

export interface DisplayData {
  progress: number
  speed: number
  remainingTime: number
}

export class SlidingWindowSpeed {
  private samples: SpeedSample[] = []
  private readonly windowSize: number

  constructor(windowSize = 5000) {
    this.windowSize = windowSize
  }

  addSample(bytes: number): void {
    const now = Date.now()
    this.samples.push({ timestamp: now, bytes })
    this.samples = this.samples.filter(
      (s) => now - s.timestamp < this.windowSize
    )
  }

  getSpeed(): number {
    if (this.samples.length < 2) return 0

    const first = this.samples[0]
    const last = this.samples[this.samples.length - 1]
    const timeDiff = (last.timestamp - first.timestamp) / 1000
    const bytesDiff = last.bytes - first.bytes

    return timeDiff > 0 ? bytesDiff / timeDiff : 0
  }

  clear(): void {
    this.samples = []
  }
}

export class ProgressCalculator {
  private tasks: Map<string, TaskProgressData> = new Map()
  private readonly throttleInterval: number
  private readonly windowSize: number

  constructor(throttleInterval = 100, windowSize = 5000) {
    this.throttleInterval = throttleInterval
    this.windowSize = windowSize
  }

  update(taskId: string, uploadedBytes: number, totalBytes: number): boolean {
    const now = Date.now()
    let taskData = this.tasks.get(taskId)

    if (!taskData) {
      taskData = {
        uploadedBytes: 0,
        totalBytes,
        lastProgress: 0,
        lastUpdateTime: 0,
        speedCalculator: new SlidingWindowSpeed(this.windowSize),
      }
      this.tasks.set(taskId, taskData)
    }

    taskData.uploadedBytes = uploadedBytes
    taskData.totalBytes = totalBytes
    taskData.speedCalculator.addSample(uploadedBytes)

    if (now - taskData.lastUpdateTime < this.throttleInterval) {
      return false
    }

    taskData.lastUpdateTime = now
    return true
  }

  getDisplayData(taskId: string): DisplayData {
    const taskData = this.tasks.get(taskId)

    if (!taskData) {
      return { progress: 0, speed: 0, remainingTime: 0 }
    }

    let progress = 0
    if (taskData.totalBytes > 0) {
      progress = (taskData.uploadedBytes / taskData.totalBytes) * 100
    }

    if (progress < taskData.lastProgress) {
      progress = taskData.lastProgress
    } else {
      taskData.lastProgress = progress
    }

    progress = Math.min(100, Math.max(0, Math.round(progress)))

    const speed = taskData.speedCalculator.getSpeed()

    let remainingTime = 0
    if (speed > 0) {
      const remainingBytes = taskData.totalBytes - taskData.uploadedBytes
      remainingTime = remainingBytes / speed
    }

    return {
      progress,
      speed: Math.max(0, speed),
      remainingTime: Math.max(0, remainingTime),
    }
  }

  clear(taskId: string): void {
    const taskData = this.tasks.get(taskId)
    if (taskData) {
      taskData.speedCalculator.clear()
      this.tasks.delete(taskId)
    }
  }

  clearAll(): void {
    this.tasks.forEach((taskData) => {
      taskData.speedCalculator.clear()
    })
    this.tasks.clear()
  }

  reset(taskId: string): void {
    const taskData = this.tasks.get(taskId)
    if (taskData) {
      taskData.uploadedBytes = 0
      taskData.lastProgress = 0
      taskData.lastUpdateTime = 0
      taskData.speedCalculator.clear()
    }
  }
}

export const progressCalculator = new ProgressCalculator()
