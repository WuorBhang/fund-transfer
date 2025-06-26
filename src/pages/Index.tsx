
import { useState } from "react";
import { AccountCard } from "@/components/AccountCard";
import { TransferModal } from "@/components/TransferModal";
import { TransactionLog } from "@/components/TransactionLog";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, Filter } from "lucide-react";
import { useTreasury } from "@/hooks/useTreasury";
import { convertCurrency } from "@/utils/currency";

const Index = () => {
  const { accounts, transactions, handleTransfer, handleReverseTransaction } = useTreasury();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedCurrencyFilter, setSelectedCurrencyFilter] = useState<string>("all");

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
