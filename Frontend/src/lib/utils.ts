import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullImageUrl(path: string | undefined) {
  if (!path) return 'https://via.placeholder.com/400x300?text=No+Image';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Get API URL and strip /api suffix robustly
  const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.split('/api')[0];
  
  // Ensure the relative path starts with a single slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}
