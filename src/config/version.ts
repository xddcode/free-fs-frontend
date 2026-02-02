/**
 * 应用版本配置
 * 自动从 package.json 读取版本号
 */
import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
