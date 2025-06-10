import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const lowerCase = (str: string): string => {
  return (
    str
      // Split on word boundaries and transitions between lowercase and uppercase
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .match(/[A-Za-z0-9]+/g)
      ?.map((word) => word.toLowerCase())
      .join(' ') || ''
  );
};

/**
 * Format a number or string as Indonesian Rupiah currency
 * @param value - The value to format (number, string, or null)
 * @returns Formatted currency string (e.g., "Rp 15.550.000")
 */
export const formatIDRCurrency = (value: number | string | null): string => {
  if (value === null || value === undefined) {
    return 'Rp 0';
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (Number.isNaN(numericValue)) {
    return 'Rp 0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue);
};
