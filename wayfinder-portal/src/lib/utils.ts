import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function calculateProgress(start: Date, end: Date, current: Date): number {
  const total = end.getTime() - start.getTime();
  const elapsed = current.getTime() - start.getTime();
  return Math.min(Math.max((elapsed / total) * 100, 0), 100);
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'completed':
      return 'text-blue-600 bg-blue-100';
    case 'canceled':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'landmark':
      return 'text-purple-600 bg-purple-100';
    case 'nature':
      return 'text-green-600 bg-green-100';
    case 'partner_location':
      return 'text-blue-600 bg-blue-100';
    case 'fun_fact':
      return 'text-yellow-600 bg-yellow-100';
    case 'traffic_alert':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}