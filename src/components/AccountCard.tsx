
import { Account } from "@/pages/Index";
import { Card } from "@/components/ui/card";

interface AccountCardProps {
  account: Account;
}

export const AccountCard = ({ account }: AccountCardProps) => {
  const getCurrencyColor = (currency: string) => {
    switch (currency) {
      case "KES": return "bg-green-50 border-green-200 text-green-800";
      case "USD": return "bg-blue-50 border-blue-200 text-blue-800";
      case "NGN": return "bg-purple-50 border-purple-200 text-purple-800";
      default: return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "KES": return "KSh";
      case "USD": return "$";
      case "NGN": return "₦";
      default: return "";
    }
  };

  const formatBalance = (balance: number, currency: string) => {
    return `${getCurrencySymbol(currency)}${balance.toLocaleString()}`;
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 bg-white border border-gray-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 text-sm truncate pr-2">
            {account.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCurrencyColor(account.currency)}`}>
            {account.currency}
          </span>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Available Balance</p>
          <p className="text-lg font-bold text-gray-900">
            {formatBalance(account.balance, account.currency)}
          </p>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full"
            style={{ width: `${Math.min((account.balance / 1000000) * 100, 100)}%` }}
          />
        </div>
      </div>
    </Card>
  );
};
