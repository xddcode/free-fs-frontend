import React from 'react';
import './Folder.css';

interface FolderProps {
  color?: string;
  size?: number;
  items?: React.ReactNode[];
  className?: string;
  disableAnimation?: boolean; // 是否禁用动画（用于弹窗等场景）
}

const darkenColor = (hex: string, percent: number): string => {
  let color = hex.startsWith('#') ? hex.slice(1) : hex;
  if (color.length === 3) {
    color = color
      .split('')
      .map(c => c + c)
      .join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.max(0, Math.min(255, Math.floor(r * (1 - percent))));
  g = Math.max(0, Math.min(255, Math.floor(g * (1 - percent))));
  b = Math.max(0, Math.min(255, Math.floor(b * (1 - percent))));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

const Folder: React.FC<FolderProps> = ({ color, size = 1, items = [], className = '', disableAnimation = false }) => {
  const maxItems = 3;
  const papers = items.slice(0, maxItems);
  while (papers.length < maxItems) {
    papers.push(null);
  }

  // 如果没有传入 color，使用 CSS 变量的主题色
  const folderColor = color || 'var(--primary)';
  const folderBackColor = color ? darkenColor(color, 0.08) : 'var(--primary)';
  const paper1 = darkenColor('#ffffff', 0.1);
  const paper2 = darkenColor('#ffffff', 0.05);
  const paper3 = '#ffffff';

  const folderStyle: React.CSSProperties = {
    '--folder-color': folderColor,
    '--folder-back-color': folderBackColor,
    '--paper-1': paper1,
    '--paper-2': paper2,
    '--paper-3': paper3
  } as React.CSSProperties;

  const scaleStyle = { transform: `scale(${size})` };
  
  // 如果禁用动画，添加 folder-static class
  const folderClassName = disableAnimation ? 'folder folder-static' : 'folder';

  return (
    <div style={scaleStyle} className={className}>
      <div className={folderClassName} style={folderStyle}>
        <div className="folder__back">
          {papers.map((item, i) => (
            <div key={i} className={`paper paper-${i + 1}`}>
              {item}
            </div>
          ))}
          <div className="folder__front"></div>
          <div className="folder__front right"></div>
        </div>
      </div>
    </div>
  );
};

export default Folder;
