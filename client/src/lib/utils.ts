import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(amount).replace('Ksh', 'KES');
}

export function calculateDiscount(price: number, initialPrice?: number | null): number | null {
  if (!initialPrice || initialPrice <= price) return null;
  const diff = ((initialPrice - price) / initialPrice) * 100;
  return Math.round(diff);
}
