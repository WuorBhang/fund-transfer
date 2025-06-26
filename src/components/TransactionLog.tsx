import { Transaction } from "@/pages/Index";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, RefreshCw, Undo2, CheckCircle } from "lucide-react";

interface TransactionLogProps {
  transactions: Transaction[];
  onReverseTransaction: (transactionId: string) => void;
}

export const TransactionLog = ({ transactions, onReverseTransaction }: TransactionLogProps) => {
  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      KES: "KSh",
      NGN: "₦",
    };
    return `${symbols[currency]}${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (transactions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-3">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <ArrowRightLeft className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No transactions yet</h3>
          <p className="text-gray-500">Transfer funds between accounts to see transaction history.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                  <div className="flex items-center gap-2">
                    #{transaction.id}
                    {transaction.isReversed && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                        Reversed
                      </Badge>
                    )}
                    {transaction.reversalOfTransaction && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                        Reversal
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === "conversion" ? "bg-purple-100" : "bg-blue-100"
                    }`}>
                      {transaction.type === "conversion" ? (
                        <RefreshCw className="w-4 h-4 text-purple-600" />
                      ) : (
                        <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.fromAccount}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        → {transaction.toAccount}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    {transaction.convertedAmount && transaction.convertedCurrency && (
                      <p className="text-xs text-gray-500">
                        → {formatCurrency(transaction.convertedAmount, transaction.convertedCurrency)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={transaction.type === "conversion" ? "secondary" : "default"}
                    className={transaction.type === "conversion" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"}
                  >
                    {transaction.type === "conversion" ? "FX Transfer" : "Transfer"}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(transaction.timestamp)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                  <div className="truncate" title={transaction.note}>
                    {transaction.note || "—"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.isReversed ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Reversed</span>
                    </div>
                  ) : transaction.reversalOfTransaction ? (
                    <Badge variant="outline" className="text-blue-600">
                      Reversal
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReverseTransaction(transaction.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Undo2 className="w-4 h-4 mr-1" />
                      Reverse
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
