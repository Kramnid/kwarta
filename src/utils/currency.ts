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
    return `${CURRENCY_SYMBOL} 0.00`;
  }

  const isNegative = amountInPesos < 0;
  const absAmount = Math.abs(amountInPesos);

  // Format with thousands separator and two decimal places
  const formattedNumber = absAmount.toLocaleString(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${isNegative ? '-' : ''}${CURRENCY_SYMBOL} ${formattedNumber}`;
}

/**
 * Formats an integer centavo amount directly into standard Philippine Peso format.
 * Used when reading raw monetary amounts from the SQLite database.
 *
 * Examples:
 *  1250000  → "₱ 12,500.00"
 *  150050   → "₱ 1,500.50"
 *  -25000   → "-₱ 250.00"
 *  0        → "₱ 0.00"
 *
 * @param centavos Amount in integer centavos (e.g. 1250000 for ₱12,500.00)
 * @returns Formatted currency string
 */
export function formatCentavosToPhp(centavos: number): string {
  if (isNaN(centavos) || !isFinite(centavos)) {
    return `${CURRENCY_SYMBOL} 0.00`;
  }

  const pesos = centavos / 100;
  return formatPhp(pesos);
}

/**
 * Splits integer centavos into separate currency symbol and numeric strings.
 * Ideal for high-end fintech balance displays where symbol and amount are styled distinctly.
 */
export function splitCentavosToPhp(centavos: number): {
  symbol: string;
  formattedAmount: string;
  isNegative: boolean;
} {
  const isNegative = centavos < 0;
  const absCentavos = Math.abs(centavos || 0);
  const pesos = absCentavos / 100;
  const formattedAmount = pesos.toLocaleString(CURRENCY_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return {
    symbol: CURRENCY_SYMBOL,
    formattedAmount,
    isNegative,
  };
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

/**
 * Formats centavos into a compact string suitable for chart axes and small badges.
 * Examples: 0 -> "₱0", 50000 -> "₱500", 150000 -> "₱1.5k", 1000000 -> "₱10k"
 */
export function formatCompactCentavosToPhp(centavos: number): string {
  if (isNaN(centavos) || !isFinite(centavos) || centavos <= 0) {
    return '₱0';
  }
  const pesos = centavos / 100;
  if (pesos >= 1_000_000) {
    const m = (pesos / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return `₱${m}M`;
  }
  if (pesos >= 1_000) {
    const k = (pesos / 1_000).toFixed(1).replace(/\.0$/, '');
    return `₱${k}k`;
  }
  return `₱${Math.round(pesos)}`;
}

/**
 * Pure integer-safe conversion of a user input string to integer centavos.
 * Avoids floating-point math completely.
 */
export function stringToCentavos(str: string): number {
  const cleaned = str.replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;

  const parts = cleaned.split('.');
  const whole = parseInt(parts[0] || '0', 10);
  let fraction = 0;

  if (parts.length > 1) {
    const fracStr = (parts[1] || '').substring(0, 2).padEnd(2, '0');
    fraction = parseInt(fracStr, 10);
  }

  return (isNaN(whole) ? 0 : whole) * 100 + (isNaN(fraction) ? 0 : fraction);
}

/**
 * Converts integer centavos to user editable string (e.g. 12550 -> "125.50").
 */
export function centavosToEditableString(centavos: number): string {
  if (!centavos || centavos <= 0) return '';
  const pesos = (centavos / 100).toFixed(2);
  return pesos.endsWith('.00') ? String(Math.floor(centavos / 100)) : pesos;
}
