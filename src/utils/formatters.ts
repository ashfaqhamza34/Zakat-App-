/**
 * Formatting utilities for Pakistani Rupee (PKR) and numeric values.
 */

export function formatPKR(value: number, includePrefix = true): string {
  if (isNaN(value) || !isFinite(value)) return includePrefix ? 'PKR 0' : '0';
  
  // Format with standard thousand separators
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(rounded);

  return includePrefix ? `PKR ${formatted}` : formatted;
}

export function formatGrams(grams: number): string {
  if (isNaN(grams) || !isFinite(grams)) return '0 g';
  return `${new Intl.NumberFormat('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(grams)} g`;
}

export function parsePositiveNumber(raw: string): number {
  if (!raw) return 0;
  // Strip out commas and non-numeric chars except dot
  const sanitized = raw.replace(/,/g, '').trim();
  const num = parseFloat(sanitized);
  if (isNaN(num) || num < 0) return 0;
  return num;
}
