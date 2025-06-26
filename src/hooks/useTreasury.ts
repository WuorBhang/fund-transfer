
import { useState } from "react";
import { Account, Transaction } from "@/types/treasury";
import { INITIAL_ACCOUNTS } from "@/constants/accounts";
import { convertCurrency } from "@/utils/currency";
import { useToast } from "@/hooks/use-toast";

export const useTreasury = () => {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { toast } = useToast();

  const handleTransfer = (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    note?: string
  ) => {
    const fromAccount = accounts.find(acc => acc.id === fromAccountId);
    const toAccount = accounts.find(acc => acc.id === toAccountId);

    if (!fromAccount || !toAccount || fromAccount.balance < amount) {
      return false;
    }

    // Update account balances
    const updatedAccounts = accounts.map(account => {
      if (account.id === fromAccountId) {
        return { ...account, balance: account.balance - amount };
      }
      if (account.id === toAccountId) {
        if (fromAccount.currency === toAccount.currency) {
          return { ...account, balance: account.balance + amount };
        } else {
          // Handle FX conversion with static rates
          const convertedAmount = convertCurrency(amount, fromAccount.currency, toAccount.currency);
          return { ...account, balance: account.balance + convertedAmount };
        }
      }
      return account;
    });

    setAccounts(updatedAccounts);

    // Generate unique transaction ID
    const transactionId = `TXN${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Add transaction record
    const newTransaction: Transaction = {
      id: transactionId,
      fromAccount: fromAccount.name,
      toAccount: toAccount.name,
      amount,
      currency: fromAccount.currency,
      convertedAmount: fromAccount.currency !== toAccount.currency 
        ? convertCurrency(amount, fromAccount.currency, toAccount.currency)
        : undefined,
      convertedCurrency: fromAccount.currency !== toAccount.currency ? toAccount.currency : undefined,
      note,
      timestamp: new Date(),
      type: fromAccount.currency !== toAccount.currency ? "conversion" : "transfer",
      isReversed: false,
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  const handleReverseTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Check if transaction is already reversed
    if (transaction.isReversed) {
      toast({
        title: "Reversal Failed",
        description: `Transaction ${transactionId} has already been reversed.`,
        variant: "destructive",
      });
      return;
    }

    // Check if this is already a reversal transaction
    if (transaction.reversalOfTransaction) {
      toast({
        title: "Reversal Failed",
        description: "Cannot reverse a reversal transaction.",
        variant: "destructive",
      });
      return;
    }

    // Find the accounts involved
    const fromAccount = accounts.find(acc => acc.name === transaction.fromAccount);
    const toAccount = accounts.find(acc => acc.name === transaction.toAccount);

    if (!fromAccount || !toAccount) {
      toast({
        title: "Reversal Failed",
        description: "Could not find the accounts involved in this transaction.",
        variant: "destructive",
      });
      return;
    }

    // Check if the destination account has sufficient balance to reverse
    const amountToReverse = transaction.convertedAmount || transaction.amount;
    if (toAccount.balance < amountToReverse) {
      toast({
        title: "Reversal Failed",
        description: "Insufficient balance in destination account to reverse this transaction.",
        variant: "destructive",
      });
      return;
    }

    // Reverse the transaction by updating account balances
    const updatedAccounts = accounts.map(account => {
      if (account.name === transaction.fromAccount) {
        return { ...account, balance: account.balance + transaction.amount };
      }
      if (account.name === transaction.toAccount) {
        const reversalAmount = transaction.convertedAmount || transaction.amount;
        return { ...account, balance: account.balance - reversalAmount };
      }
      return account;
    });

    setAccounts(updatedAccounts);

    // Mark original transaction as reversed
    const updatedTransactions = transactions.map(t => 
      t.id === transactionId ? { ...t, isReversed: true } : t
    );

    // Generate reversal transaction ID
    const reversalId = `REV${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Add reversal transaction record
    const reversalTransaction: Transaction = {
      id: reversalId,
      fromAccount: transaction.toAccount,
      toAccount: transaction.fromAccount,
      amount: transaction.convertedAmount || transaction.amount,
      currency: transaction.convertedCurrency || transaction.currency,
      convertedAmount: transaction.type === "conversion" ? transaction.amount : undefined,
      convertedCurrency: transaction.type === "conversion" ? transaction.currency : undefined,
      note: `Reversal of transaction ${transactionId}`,
      timestamp: new Date(),
      type: transaction.type,
      isReversed: false,
      reversalOfTransaction: transactionId,
    };

    setTransactions([reversalTransaction, ...updatedTransactions]);

    toast({
      title: "Transaction Reversed",
      description: `Transaction ${transactionId} has been successfully reversed.`,
    });
  };

  return {
    accounts,
    transactions,
    handleTransfer,
    handleReverseTransaction,
  };
};
