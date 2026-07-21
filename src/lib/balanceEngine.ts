/**
 * SplitX Balance Engine
 * 
 * Calculates the optimal number of transactions required to settle debts among a group of people.
 * Uses a greedy approach to min-cash-flow algorithm (O(N log N) with sorting).
 */

type Balance = {
  userId: string;
  amount: number; // positive means they are owed, negative means they owe
};

export type Settlement = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};

export function calculateOptimalSettlements(balances: Balance[]): Settlement[] {
  // Separate into debtors (amount < 0) and creditors (amount > 0)
  const debtors = balances.filter(b => b.amount < -0.01).map(b => ({ ...b, amount: Math.abs(b.amount) }));
  const creditors = balances.filter(b => b.amount > 0.01);

  // Sort by largest amount first to minimize total transaction count
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0; // index for debtors
  let j = 0; // index for creditors

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const settledAmount = Math.min(debtor.amount, creditor.amount);
    
    // Create a transaction
    settlements.push({
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
      amount: Number(settledAmount.toFixed(2)) // handle JS float precision
    });

    // Update remaining balances
    debtor.amount -= settledAmount;
    creditor.amount -= settledAmount;

    // Move to next person if their balance is fully settled
    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return settlements;
}

/**
 * Example Usage:
 * const balances = [
 *   { userId: "userA", amount: -240 }, // owes 240
 *   { userId: "userB", amount: -105.5 }, // owes 105.5
 *   { userId: "userC", amount: 345.5 } // is owed 345.5
 * ];
 * 
 * const settlements = calculateOptimalSettlements(balances);
 * // Results in userA -> userC ($240) and userB -> userC ($105.5)
 */
