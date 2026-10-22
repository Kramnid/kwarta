/**
 * Financial Accuracy Test Script for Kwarta Step 3
 * Validates the arithmetic requirements specified in Section 16 of the prompt:
 *
 * Test scenario:
 * 1. Income: ₱10,000 (1,000,000 centavos)
 * 2. Income: ₱2,000 (200,000 centavos)
 * 3. Expense: ₱1,500 (150,000 centavos)
 * 4. Expense: ₱750 (75,000 centavos)
 * Expected:
 *  - Total Income: ₱12,000 (1,200,000 centavos)
 *  - Total Expenses: ₱2,250 (225,000 centavos)
 *  - Total Balance: ₱9,750 (975,000 centavos)
 *
 * 5. Edit ₱750 expense to ₱1,000 (100,000 centavos):
 * Expected:
 *  - Total Expenses: ₱2,500 (250,000 centavos)
 *  - Total Balance: ₱9,500 (950,000 centavos)
 *
 * 6. Delete ₱1,500 expense:
 * Expected:
 *  - Total Expenses: ₱1,000 (100,000 centavos)
 *  - Total Balance: ₱11,000 (1,100,000 centavos)
 */

function calculateTotalIncome(transactions) {
  return transactions.reduce((acc, tx) => {
    if (tx.type === 'income') {
      return acc + (tx.amount_centavos || 0);
    }
    return acc;
  }, 0);
}

function calculateTotalExpenses(transactions) {
  return transactions.reduce((acc, tx) => {
    if (tx.type === 'expense') {
      return acc + (tx.amount_centavos || 0);
    }
    return acc;
  }, 0);
}

function calculateTotalBalance(transactions) {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
}

function formatCentavosToPhp(centavos) {
  const isNegative = centavos < 0;
  const abs = Math.abs(centavos) / 100;
  return `${isNegative ? '-' : ''}₱${abs.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

let transactions = [
  { id: 't1', type: 'income', amount_centavos: 1000000, title: 'Salary' },
  { id: 't2', type: 'income', amount_centavos: 200000, title: 'Bonus' },
  { id: 't3', type: 'expense', amount_centavos: 150000, title: 'Groceries' },
  { id: 't4', type: 'expense', amount_centavos: 75000, title: 'Dining' },
];

console.log('--- Initial Transactions ---');
let income = calculateTotalIncome(transactions);
let expenses = calculateTotalExpenses(transactions);
let balance = calculateTotalBalance(transactions);

console.log(`Income: ${formatCentavosToPhp(income)} (expected ₱12,000.00)`);
console.log(`Expenses: ${formatCentavosToPhp(expenses)} (expected ₱2,250.00)`);
console.log(`Balance: ${formatCentavosToPhp(balance)} (expected ₱9,750.00)`);

if (income !== 1200000 || expenses !== 225000 || balance !== 975000) {
  console.error('FAILED Initial Calculations');
  process.exit(1);
}

console.log('\n--- After Editing ₱750 Expense to ₱1,000 ---');
transactions = transactions.map((t) =>
  t.id === 't4' ? { ...t, amount_centavos: 100000 } : t
);
income = calculateTotalIncome(transactions);
expenses = calculateTotalExpenses(transactions);
balance = calculateTotalBalance(transactions);

console.log(`Income: ${formatCentavosToPhp(income)} (expected ₱12,000.00)`);
console.log(`Expenses: ${formatCentavosToPhp(expenses)} (expected ₱2,500.00)`);
console.log(`Balance: ${formatCentavosToPhp(balance)} (expected ₱9,500.00)`);

if (income !== 1200000 || expenses !== 250000 || balance !== 950000) {
  console.error('FAILED Edit Calculation');
  process.exit(1);
}

console.log('\n--- After Deleting ₱1,500 Expense ---');
transactions = transactions.filter((t) => t.id !== 't3');
income = calculateTotalIncome(transactions);
expenses = calculateTotalExpenses(transactions);
balance = calculateTotalBalance(transactions);

console.log(`Income: ${formatCentavosToPhp(income)} (expected ₱12,000.00)`);
console.log(`Expenses: ${formatCentavosToPhp(expenses)} (expected ₱1,000.00)`);
console.log(`Balance: ${formatCentavosToPhp(balance)} (expected ₱11,000.00)`);

if (income !== 1200000 || expenses !== 100000 || balance !== 1100000) {
  console.error('FAILED Delete Calculation');
  process.exit(1);
}

console.log('\nAll Financial Accuracy Tests PASSED successfully!');
