import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind CSS classes with clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format bytes to human readable
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Format latency
export function formatLatency(ms: number) {
  if (ms < 1) return '<1ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// Truncate string
export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

// Generate random ID
export function generateId() {
  return Math.random().toString(36).substring(2, 15);
}

// Delay function for animations
export function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
