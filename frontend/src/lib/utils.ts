import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * A utility function to conditionally join class names together.
 * @param inputs The class names to join.
 * @returns The joined class names.
 * @example cn("text-red-500", { "bg-blue-500": isBlue })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as a currency string (e.g., $1,234.56).
 * @param amount The number to format.
 * @returns The formatted currency string.
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a number as a compact currency string (e.g., $1.2K, $4.5M).
 * If the number is less than 1000, it uses the standard format.
 * @param amount The number to format.
 * @returns The formatted compact currency string.
 */
export const formatCompactCurrency = (amount: number): string => {
  if (Math.abs(amount) < 1000) {
    return formatCurrency(amount);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    compactDisplay: 'short',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

 