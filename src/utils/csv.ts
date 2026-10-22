/**
 * CSV Formatting and Escaping Utilities for Kwarta
 */

import { Transaction, TransactionCategory } from '@/types/finance';

/**
 * Escapes a single CSV cell according to RFC 4180 standard.
 * Wraps values containing commas, double quotes, or newlines in quotes,
 * and doubles internal quotation marks.
 */
export function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  const stringValue = String(value);

  // If value contains comma, double-quote, or newline, escape it
  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Converts a list of transactions into an RFC 4180 compliant CSV string with UTF-8 BOM.
 */
export function generateTransactionsCsv(
  transactions: Transaction[],
  categoriesMap?: Map<string, TransactionCategory>
): string {
  const headers = [
    'Transaction ID',
    'Date',
    'Type',
    'Title',
    'Category',
    'Amount (PHP)',
    'Note',
  ];

  const rows = transactions.map((tx) => {
    const categoryName =
      tx.category?.name ||
      (categoriesMap && tx.category_id ? categoriesMap.get(tx.category_id)?.name : '') ||
      'Uncategorized';

    const decimalAmount = (tx.amount_centavos / 100).toFixed(2);
    const signedAmount = tx.type === 'expense' ? `-${decimalAmount}` : decimalAmount;

    return [
      escapeCsvCell(tx.id),
      escapeCsvCell(tx.transaction_date),
      escapeCsvCell(tx.type.toUpperCase()),
      escapeCsvCell(tx.title),
      escapeCsvCell(categoryName),
      escapeCsvCell(signedAmount),
      escapeCsvCell(tx.note || ''),
    ].join(',');
  });

  // UTF-8 BOM (\uFEFF) ensures Excel and spreadsheet apps decode UTF-8 correctly
  const csvContent = ['\uFEFF' + headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  return csvContent;
}
