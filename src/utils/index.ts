/**
 * 工具函式
 * 包含常用的工具函式，如 cn（用於合併 className）
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 Tailwind CSS class names
 *
 * @param inputs - 要合併的 class names
 * @returns 合併後的 class name 字串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
