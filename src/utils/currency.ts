/**
 * Currency Utilities for Kwarta
 *
 * Primary Currency: Philippine Peso (PHP / ₱)
 * Standard Locale: en-PH
 *
 * NOTE: All monetary values in the SQLite database are stored as integer centavos
 * (e.g. ₱12,500.00 is stored as 1250000) to eliminate floating-point rounding errors.
 */

export const CURRENCY_SYMBOL = '₱';
export const CURRENCY_CODE = 'PHP';
export const CURRENCY_LOCALE = 'en-PH';

/**
 * Formats a numeric peso amount into standard Philippine Peso format.
 *
 * Examples:
 *  12500    → "₱12,500.00"
 *  1500.50  → "₱1,500.50"
 *  -250     → "-₱250.00"
 *  0        → "₱0.00"
 *
 * @param amountInPesos Amount in full Pesos (e.g. 1500.50)
 * @returns Formatted currency string
 */
export function formatPhp(amountInPesos: number): string {
  if (isNaN(amountInPesos) || !isFinite(amountInPesos)) {
    return `${CURRENCY_SYMBOL}0.00`;
  }

  const isNegative = amountInPesos < 0;
  const absAmount = Math.abs(amountInPesos);

  // Format with thousands separator and two decimal places
  const formattedNumber = absAmount.toLocaleString(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${CURRENCY_SYMBOL}${formattedNumber}`;
}

/**
 * Formats an integer centavo amount directly into standard Philippine Peso format.
 * Used when reading raw monetary amounts from the SQLite database.
 *
 * Examples:
 *  1250000  → "₱12,500.00"
 *  150050   → "₱1,500.50"
 *  -25000   → "-₱250.00"
 *  0        → "₱0.00"
 *
 * @param centavos Amount in integer centavos (e.g. 1250000 for ₱12,500.00)
 * @returns Formatted currency string
 */
export function formatCentavosToPhp(centavos: number): string {
  if (isNaN(centavos) || !isFinite(centavos)) {
    return `${CURRENCY_SYMBOL}0.00`;
  }

  const pesos = centavos / 100;
  return formatPhp(pesos);
}

/**
 * Converts a peso amount (with optional decimals) to integer centavos for database storage.
 * Uses Math.round to prevent IEEE-754 precision issues (e.g., 0.14 * 100).
 *
 * @param pesos Amount in pesos
 * @returns Integer centavos
 */
export function pesosToCentavos(pesos: number): number {
  if (isNaN(pesos) || !isFinite(pesos)) {
    return 0;
  }
  return Math.round(pesos * 100);
}

/**
 * Converts integer centavos from the database into decimal pesos.
 *
 * @param centavos Integer centavos
 * @returns Decimal pesos
 */
export function centavosToPesos(centavos: number): number {
  if (isNaN(centavos) || !isFinite(centavos)) {
    return 0;
  }
  return centavos / 100;
}

/**
 * Parses user text input into a clean numeric peso value.
 * Strips currency symbols, commas, and whitespace.
 *
 * @param input Raw text string (e.g. "₱ 1,500.50")
 * @returns Numeric peso value
 */
export function parseCurrencyInput(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
