import SparkMD5 from 'spark-md5'

/**
 * 快速指纹阈值：大于此大小的文件使用快速指纹（100MB）
 */
const FAST_FINGERPRINT_THRESHOLD = 100 * 1024 * 1024

/**
 * 计算文件的快速指纹（采样策略）
 * 对于大文件，只计算头部、中部、尾部的 MD5，大幅提升速度
 */
export function calculateFastFingerprint(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const sampleSize = 2 * 1024 * 1024 // 每个采样点 2MB
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    // 采样点：头部、中部、尾部
    const samples: { start: number; end: number }[] = []

    // 头部
    samples.push({ start: 0, end: Math.min(sampleSize, file.size) })

    // 中部（如果文件足够大）
    if (file.size > sampleSize * 3) {
      const middle = Math.floor(file.size / 2)
      samples.push({
        start: middle - Math.floor(sampleSize / 2),
        end: middle + Math.floor(sampleSize / 2),
      })
    }

    // 尾部（如果文件足够大）
    if (file.size > sampleSize * 2) {
      samples.push({
        start: Math.max(0, file.size - sampleSize),
        end: file.size,
      })
    }

    let currentSample = 0

    function loadNext() {
      if (currentSample >= samples.length) {
        // 所有采样完成，生成指纹
        // 格式：文件大小-最后修改时间-采样MD5
        const sampledMd5 = spark.end()
        const fingerprint = `${file.size}-${file.lastModified}-${sampledMd5}`
        // 对组合指纹再做一次 MD5，得到固定长度的标识
        const finalMd5 = SparkMD5.hash(fingerprint)
        resolve(finalMd5)
        return
      }

      const sample = samples[currentSample]
      const chunk = file.slice(sample.start, sample.end)
      fileReader.readAsArrayBuffer(chunk)
    }

    fileReader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer)
        currentSample += 1
        loadNext()
      }
    }

    fileReader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    loadNext()
  })
}

/**
 * 计算文件的完整MD5值（用于小文件或需要精确校验的场景）
 */
export function calculateFullFileMD5(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobSlice = File.prototype.slice
    const chunkSize = 2097152 // 2MB per chunk for MD5 calculation
    const chunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    const spark = new SparkMD5.ArrayBuffer()
    const fileReader = new FileReader()

    function loadNext() {
      const start = currentChunk * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = blobSlice.call(file, start, end)
      fileReader.readAsArrayBuffer(chunk)
    }

    fileReader.onload = (e) => {
      if (e.target?.result) {
        spark.append(e.target.result as ArrayBuffer)
        currentChunk += 1

        if (currentChunk < chunks) {
          loadNext()
        } else {
          const md5 = spark.end()
          resolve(md5)
        }
      }
    }

    fileReader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    loadNext()
  })
}

/**
 * 智能计算文件 MD5
 * - 小文件（< 100MB）：使用完整 MD5
 * - 大文件（>= 100MB）：使用快速指纹
 */
export function calculateFileMD5(file: File): Promise<string> {
  if (file.size >= FAST_FINGERPRINT_THRESHOLD) {
    return calculateFastFingerprint(file)
  } else {
    return calculateFullFileMD5(file)
  }
}

/**
 * 计算Blob（分片）的MD5值
 */
export function calculateBlobMD5(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      if (e.target?.result) {
        const spark = new SparkMD5.ArrayBuffer()
        spark.append(e.target.result as ArrayBuffer)
        const md5 = spark.end()
        resolve(md5)
      }
    }

    fileReader.onerror = () => {
      reject(new Error('分片读取失败'))
    }

    fileReader.readAsArrayBuffer(blob)
  })
}
