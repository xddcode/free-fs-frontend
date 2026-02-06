import ArchiveIcon from '../../public/fi/archive'
import AudioIcon from '../../public/fi/audio'
import CodeIcon from '../../public/fi/code'
import DatabaseIcon from '../../public/fi/database'
import DefaultIcon from '../../public/fi/default'
import DocumentIcon from '../../public/fi/document'
import ExcelIcon from '../../public/fi/excel'
import FolderIcon from '../../public/fi/folder'
import FontIcon from '../../public/fi/font'
import ImageIcon from '../../public/fi/images'
import LinkIcon from '../../public/fi/link'
import LogIcon from '../../public/fi/log'
import PdfIcon from '../../public/fi/pdf'
import PptIcon from '../../public/fi/ppt'
import TextIcon from '../../public/fi/text'
import VideoIcon from '../../public/fi/video'

interface FileIconProps {
  type: string
  className?: string
  size?: number
}

/**
 * 统一的文件图标组件
 * 根据文件类型显示对应的图标，颜色自动适配主题
 */
export const FileIcon: React.FC<FileIconProps> = ({
  type,
  className = '',
  size = 48,
}) => {
  const iconType = getIconType(type)

  const iconMap: Record<
    string,
    React.FC<{ className?: string; size?: number }>
  > = {
    folder: FolderIcon,
    code: CodeIcon,
    image: ImageIcon,
    video: VideoIcon,
    audio: AudioIcon,
    document: DocumentIcon,
    pdf: PdfIcon,
    text: TextIcon,
    excel: ExcelIcon,
    ppt: PptIcon,
    link: LinkIcon,
    archive: ArchiveIcon,
    database: DatabaseIcon,
    font: FontIcon,
    log: LogIcon,
    default: DefaultIcon,
  }

  const IconComponent = iconMap[iconType] || DefaultIcon

  return <IconComponent className={className} size={size} />
}

/**
 * 根据文件扩展名确定图标类型
 */
function getIconType(type: string): string {
  const lowerType = type.toLowerCase()

  // 文件夹
  if (lowerType === 'dir' || lowerType === 'folder') return 'folder'

  // 代码文件
  const codeTypes = [
    'js',
    'jsx',
    'ts',
    'tsx',
    'vue',
    'py',
    'java',
    'cpp',
    'c',
    'h',
    'cs',
    'php',
    'rb',
    'go',
    'rs',
    'swift',
    'kt',
    'scala',
    'sh',
    'bash',
    'json',
    'xml',
    'yaml',
    'yml',
    'toml',
    'css',
    'scss',
    'sass',
    'less',
    'html',
    'htm',
    'r',
    'dart',
    'lua',
  ]
  if (codeTypes.includes(lowerType)) return 'code'

  // 图片文件
  const imageTypes = [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'bmp',
    'svg',
    'webp',
    'ico',
    'tiff',
    'tif',
    'heic',
    'heif',
  ]
  if (imageTypes.includes(lowerType)) return 'image'

  // 视频文件
  const videoTypes = [
    'mp4',
    'avi',
    'mov',
    'wmv',
    'flv',
    'mkv',
    'webm',
    'm4v',
    'mpg',
    'mpeg',
    '3gp',
    'ogv',
  ]
  if (videoTypes.includes(lowerType)) return 'video'

  // 音频文件
  const audioTypes = [
    'mp3',
    'wav',
    'flac',
    'aac',
    'ogg',
    'wma',
    'm4a',
    'opus',
    'ape',
    'alac',
  ]
  if (audioTypes.includes(lowerType)) return 'audio'

  // Word文档
  const documentTypes = ['doc', 'docx', 'odt', 'rtf', 'pages']
  if (documentTypes.includes(lowerType)) return 'document'

  // Excel表格 - 统一使用 excel 图标
  const spreadsheetTypes = [
    'xls',
    'xlsx',
    'csv',
    'ods',
    'numbers',
    'tsv',
    'xlsm',
    'xlsb',
  ]
  if (spreadsheetTypes.includes(lowerType)) return 'excel'

  // PPT演示文稿
  const presentationTypes = ['ppt', 'pptx', 'odp', 'key']
  if (presentationTypes.includes(lowerType)) return 'ppt'

  // PDF
  if (lowerType === 'pdf') return 'pdf'

  // 文本文件
  const textTypes = ['txt', 'md', 'ini', 'cfg', 'conf', 'env']
  if (textTypes.includes(lowerType)) return 'text'

  // 日志文件
  const logTypes = ['log']
  if (logTypes.includes(lowerType)) return 'log'

  // 链接文件
  if (lowerType === 'url' || lowerType === 'lnk' || lowerType === 'link')
    return 'link'

  // 压缩文件
  const archiveTypes = [
    'zip',
    'rar',
    '7z',
    'tar',
    'gz',
    'bz2',
    'xz',
    'iso',
    'dmg',
  ]
  if (archiveTypes.includes(lowerType)) return 'archive'

  // 数据库文件
  const databaseTypes = [
    'db',
    'sqlite',
    'sqlite3',
    'mdb',
    'accdb',
    'sql',
    'dbf',
    'mdf',
    'ldf',
  ]
  if (databaseTypes.includes(lowerType)) return 'database'

  // 字体文件
  const fontTypes = ['ttf', 'otf', 'woff', 'woff2', 'eot', 'fon', 'fnt']
  if (fontTypes.includes(lowerType)) return 'font'

  return 'default'
}
