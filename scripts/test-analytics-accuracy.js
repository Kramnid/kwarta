/**
 * Financial Accuracy & Analytics Calculation Validation Script for Kwarta
 *
 * Verifies:
 * 1. Isolated test dataset from Section 19:
 *    - Income: Salary ₱20,000 (2,000,000 centavos) + Freelance ₱5,000 (500,000 centavos)
 *    - Expenses: Food ₱3,000, Transportation ₱2,000, Shopping ₱4,000, Bills ₱1,000
 *    - Expected: Income ₱25,000, Expenses ₱10,000, Net ₱15,000, Savings Rate 60%,
 *                Highest Category: Shopping, Share: 40%
 * 2. Edge cases:
 *    - Zero income (savings rate is null / N/A, not NaN or Error)
 *    - Zero expenses (total expenses 0, donut safe)
 *    - Negative net cash flow (expenses > income)
 *    - Average daily spending for elapsed days vs full calendar days
 */

const assert = require('assert');

// Pure JS reproduction of our analytics calculation logic for node execution
function calculateOverview(transactions, startDate, endDate) {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    const d = tx.transaction_date;
    if (d >= startDate && d <= endDate) {
      const amt = tx.amount_centavos;
      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpenses += amt;
      }
    }
  }

  const netCashFlow = totalIncome - totalExpenses;
  const hasIncome = totalIncome > 0;
  let savingsRate = null;
  if (hasIncome) {
    const rawRate = (netCashFlow / totalIncome) * 100;
    savingsRate = Math.round(rawRate * 10) / 10;
  }

  return { totalIncome, totalExpenses, netCashFlow, savingsRate, hasIncome };
}

function calculateCategorySpending(transactions, startDate, endDate) {
  const expenseTxs = transactions.filter(
    (tx) => tx.type === 'expense' && tx.transaction_date >= startDate && tx.transaction_date <= endDate
  );
  let totalExpenses = 0;
  const map = new Map();

  for (const tx of expenseTxs) {
    totalExpenses += tx.amount_centavos;
    const catId = tx.category_id;
    const existing = map.get(catId);
    if (existing) {
      existing.amount += tx.amount_centavos;
    } else {
      map.set(catId, {
        categoryId: catId,
        categoryName: tx.category_name,
        amount: tx.amount_centavos,
      });
    }
  }

  if (totalExpenses <= 0) return [];

  const list = Array.from(map.values()).map((item) => {
    const pct = (item.amount / totalExpenses) * 100;
    return {
      ...item,
      percentage: Math.round(pct * 10) / 10,
    };
  });

  return list.sort((a, b) => b.amount - a.amount);
}

function calculateAverageDaily(totalExpensesCentavos, startDateStr, endDateStr, todayStr) {
  const parseD = (s) => new Date(s + 'T12:00:00');
  const countDays = (s1, s2) => Math.round((parseD(s2) - parseD(s1)) / (1000 * 60 * 60 * 24)) + 1;

  const totalDays = countDays(startDateStr, endDateStr);
  if (startDateStr > todayStr) {
    return { average: 0, elapsedDays: 0, isFutureOnly: true };
  }

  let elapsedDays = totalDays;
  if (todayStr < endDateStr) {
    elapsedDays = countDays(startDateStr, todayStr);
  }
  elapsedDays = Math.max(1, elapsedDays);
  const average = totalExpensesCentavos > 0 ? Math.round(totalExpensesCentavos / elapsedDays) : 0;
  return { average, elapsedDays, isFutureOnly: false };
}

console.log('--- RUNNING KWARTA STEP 5 FINANCIAL ACCURACY VALIDATION ---');

// Test 1: Isolated Financial Dataset
const testTransactions = [
  // Income: ₱20,000 + ₱5,000 = ₱25,000 (2,500,000 centavos)
  { type: 'income', amount_centavos: 2000000, category_id: 'cat_sal', category_name: 'Salary', transaction_date: '2026-10-05' },
  { type: 'income', amount_centavos: 500000, category_id: 'cat_free', category_name: 'Freelance', transaction_date: '2026-10-12' },
  // Expenses: Food ₱3,000, Transpo ₱2,000, Shopping ₱4,000, Bills ₱1,000 = ₱10,000 (1,000,000 centavos)
  { type: 'expense', amount_centavos: 300000, category_id: 'cat_food', category_name: 'Food & Drinks', transaction_date: '2026-10-06' },
  { type: 'expense', amount_centavos: 200000, category_id: 'cat_trans', category_name: 'Transportation', transaction_date: '2026-10-08' },
  { type: 'expense', amount_centavos: 400000, category_id: 'cat_shop', category_name: 'Shopping', transaction_date: '2026-10-15' },
  { type: 'expense', amount_centavos: 100000, category_id: 'cat_bills', category_name: 'Bills & Utilities', transaction_date: '2026-10-18' },
];

const overview = calculateOverview(testTransactions, '2026-10-01', '2026-10-31');
console.log('Total Income (centavos):', overview.totalIncome, '-> PHP:', overview.totalIncome / 100);
console.log('Total Expenses (centavos):', overview.totalExpenses, '-> PHP:', overview.totalExpenses / 100);
console.log('Net Cash Flow (centavos):', overview.netCashFlow, '-> PHP:', overview.netCashFlow / 100);
console.log('Savings Rate:', overview.savingsRate + '%');

assert.strictEqual(overview.totalIncome, 2500000, 'Total Income must be 2,500,000 centavos (₱25,000)');
assert.strictEqual(overview.totalExpenses, 1000000, 'Total Expenses must be 1,000,000 centavos (₱10,000)');
assert.strictEqual(overview.netCashFlow, 1500000, 'Net Cash Flow must be 1,500,000 centavos (₱15,000)');
assert.strictEqual(overview.savingsRate, 60, 'Savings Rate must be exactly 60%');

const catSpending = calculateCategorySpending(testTransactions, '2026-10-01', '2026-10-31');
console.log('Categories:', catSpending.map((c) => `${c.categoryName}: ₱${c.amount / 100} (${c.percentage}%)`));

assert.strictEqual(catSpending[0].categoryName, 'Shopping', 'Top spending category must be Shopping');
assert.strictEqual(catSpending[0].amount, 400000, 'Shopping amount must be ₱4,000');
assert.strictEqual(catSpending[0].percentage, 40, 'Shopping percentage must be 40%');

const totalPercentage = catSpending.reduce((acc, c) => acc + c.percentage, 0);
assert(Math.abs(totalPercentage - 100) < 0.2, 'Percentages must total approximately 100%');

// Test 2: Zero Income Edge Case
const zeroIncomeOverview = calculateOverview(
  testTransactions.filter((tx) => tx.type === 'expense'),
  '2026-10-01',
  '2026-10-31'
);
assert.strictEqual(zeroIncomeOverview.totalIncome, 0);
assert.strictEqual(zeroIncomeOverview.savingsRate, null, 'Savings rate with 0 income must be null (displayed as N/A)');

// Test 3: Negative Cash Flow
const negativeOverview = calculateOverview(
  [
    { type: 'income', amount_centavos: 100000, transaction_date: '2026-10-01' },
    { type: 'expense', amount_centavos: 300000, transaction_date: '2026-10-02' },
  ],
  '2026-10-01',
  '2026-10-31'
);
assert.strictEqual(negativeOverview.netCashFlow, -200000);
assert.strictEqual(negativeOverview.savingsRate, -200);

// Test 4: Average Daily Spending
// 10,000 PHP expenses (1,000,000 centavos) over an ongoing month where today is Oct 20 (20 elapsed days)
const avgOngoing = calculateAverageDaily(1000000, '2026-10-01', '2026-10-31', '2026-10-20');
assert.strictEqual(avgOngoing.elapsedDays, 20);
assert.strictEqual(avgOngoing.average, 50000, 'Average must be 50,000 centavos (₱500/day)');

// Historical month: Sep 1 to Sep 30 (30 days) with ₱9,000 expenses (900,000 centavos)
const avgPast = calculateAverageDaily(900000, '2026-09-01', '2026-09-30', '2026-10-22');
assert.strictEqual(avgPast.elapsedDays, 30);
assert.strictEqual(avgPast.average, 30000, 'Average must be 30,000 centavos (₱300/day)');

console.log('✅ ALL STEP 5 FINANCIAL ACCURACY TESTS PASSED!');
