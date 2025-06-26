import { useState } from "react";
import { AccountCard } from "@/components/AccountCard";
import { TransferModal } from "@/components/TransferModal";
import { TransactionLog } from "@/components/TransactionLog";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Account {
  id: string;
  name: string;
  currency: "KES" | "USD" | "NGN";
  balance: number;
}

export interface Transaction {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  note?: string;
  timestamp: Date;
  type: "transfer" | "conversion";
}

const INITIAL_ACCOUNTS: Account[] = [
  { id: "1", name: "Mpesa_KES_1", currency: "KES", balance: 250000 },
  { id: "2", name: "Mpesa_KES_2", currency: "KES", balance: 180000 },
  { id: "3", name: "Bank_KES_Main", currency: "KES", balance: 500000 },
  { id: "4", name: "Bank_USD_1", currency: "USD", balance: 15000 },
  { id: "5", name: "Bank_USD_2", currency: "USD", balance: 25000 },
  { id: "6", name: "Forex_USD_Reserve", currency: "USD", balance: 50000 },
  { id: "7", name: "Bank_NGN_1", currency: "NGN", balance: 2500000 },
  { id: "8", name: "Bank_NGN_2", currency: "NGN", balance: 1800000 },
  { id: "9", name: "Mobile_NGN_Main", currency: "NGN", balance: 750000 },
  { id: "10", name: "Treasury_NGN_Reserve", currency: "NGN", balance: 3200000 },
];

const Index = () => {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState<string>("all");
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
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return true;
  };

  const handleReverseTransaction = (transactionId: string) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    // Find the accounts involved
    const fromAccount = accounts.find(acc => acc.name === transaction.fromAccount);
    const toAccount = accounts.find(acc => acc.name === transaction.toAccount);

    if (!fromAccount || !toAccount) {
      toast({
        title: "Reverse Failed",
        description: "Could not find the accounts involved in this transaction.",
        variant: "destructive",
      });
      return;
    }

    // Check if the destination account has sufficient balance to reverse
    const amountToReverse = transaction.convertedAmount || transaction.amount;
    if (toAccount.balance < amountToReverse) {
      toast({
        title: "Reverse Failed",
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
    };

    setTransactions(prev => [reversalTransaction, ...prev]);

    toast({
      title: "Transaction Reversed",
      description: `Transaction ${transactionId} has been successfully reversed.`,
    });
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    // Static exchange rates for demo purposes
    const rates: Record<string, Record<string, number>> = {
      USD: { KES: 150, NGN: 1600 },
      KES: { USD: 1/150, NGN: 10.67 },
      NGN: { USD: 1/1600, KES: 1/10.67 },
    };

    if (fromCurrency === toCurrency) return amount;
    return Math.round(amount * rates[fromCurrency][toCurrency] * 100) / 100;
  };

  const filteredTransactions = selectedCurrencyFilter === "all" 
    ? transactions 
    : transactions.filter(t => 
        t.currency === selectedCurrencyFilter || 
        t.convertedCurrency === selectedCurrencyFilter
      );

  const totalBalanceUSD = accounts.reduce((total, account) => {
    const balanceInUSD = account.currency === "USD" 
      ? account.balance 
      : convertCurrency(account.balance, account.currency, "USD");
    return total + balanceInUSD;
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Treasury Movement Simulator</h1>
              <p className="text-gray-600 mt-1">Manage funds across 10 virtual accounts</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-blue-600">${totalBalanceUSD.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Account Overview</h2>
            <Button 
              onClick={() => setIsTransferModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              New Transfer
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>

        {/* Transaction Log */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={selectedCurrencyFilter}
                onChange={(e) => setSelectedCurrencyFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="all">All Currencies</option>
                <option value="KES">KES Only</option>
                <option value="USD">USD Only</option>
                <option value="NGN">NGN Only</option>
              </select>
            </div>
          </div>
          
          <TransactionLog 
            transactions={filteredTransactions} 
            onReverseTransaction={handleReverseTransaction}
          />
        </div>
      </div>

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        accounts={accounts}
        onTransfer={handleTransfer}
      />
    </div>
  );
};

export default Index;
