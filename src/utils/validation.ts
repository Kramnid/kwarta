/**
 * Transaction Input Validation for Kwarta
 */

import { CreateTransactionInput, TransactionCategory } from '@/types/finance';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Maximum allowed amount: ₱1,000,000,000.00 (100 billion centavos)
export const MAX_SAFE_AMOUNT_CENTAVOS = 100_000_000_000;

export function validateTransactionInput(
  input: Partial<CreateTransactionInput>,
  categories: TransactionCategory[]
): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Amount validation
  if (
    input.amount_centavos === undefined ||
    input.amount_centavos === null ||
    isNaN(input.amount_centavos)
  ) {
    errors.amount = 'Please enter a valid amount.';
  } else if (input.amount_centavos <= 0) {
    errors.amount = 'Amount must be greater than ₱0.00.';
  } else if (input.amount_centavos > MAX_SAFE_AMOUNT_CENTAVOS) {
    errors.amount = 'Amount exceeds maximum allowable limit.';
  }

  // 2. Title validation
  const title = (input.title || '').trim();
  if (!title) {
    errors.title = 'Title is required.';
  } else if (title.length > 100) {
    errors.title = 'Title must be 100 characters or less.';
  }

  // 3. Note validation (optional)
  if (input.note && input.note.length > 500) {
    errors.note = 'Note must be 500 characters or less.';
  }

  // 4. Category validation
  if (!input.category_id) {
    errors.category = 'Please select a category.';
  } else {
    const matchingCategory = categories.find((c) => c.id === input.category_id);
    if (!matchingCategory) {
      errors.category = 'Selected category does not exist.';
    } else if (input.type && matchingCategory.type !== input.type) {
      errors.category = `Selected category does not match transaction type (${input.type}).`;
    }
  }

  // 5. Date validation
  if (!input.transaction_date) {
    errors.date = 'Date is required.';
  } else {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(input.transaction_date)) {
      errors.date = 'Invalid date format (must be YYYY-MM-DD).';
    } else {
      const parsed = new Date(input.transaction_date);
      if (isNaN(parsed.getTime())) {
        errors.date = 'Invalid calendar date.';
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
