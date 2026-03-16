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

export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function getBoundingBox(lat: number, lon: number, radiusKm: number): [[number, number], [number, number]] {
  const latDelta = radiusKm / 111.32;
  const lonDelta = radiusKm / (111.32 * Math.cos(lat * (Math.PI / 180)));
  
  return [
    [lat - latDelta, lon - lonDelta], // SW
    [lat + latDelta, lon + lonDelta]  // NE
  ];
}
