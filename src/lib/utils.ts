// ABOUTME: Utility functions for the application
// ABOUTME: Provides cn() function for merging tailwind classes conditionally
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
