
import { useState } from "react";
import { Account } from "@/pages/Index";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRightLeft, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onTransfer: (fromAccountId: string, toAccountId: string, amount: number, note?: string) => boolean;
}

export const TransferModal = ({ isOpen, onClose, accounts, onTransfer }: TransferModalProps) => {
  const [fromAccount, setFromAccount] = useState<string>("");
  const [toAccount, setToAccount] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const selectedFromAccount = accounts.find(acc => acc.id === fromAccount);
  const selectedToAccount = accounts.find(acc => acc.id === toAccount);
  const amountNum = parseFloat(amount) || 0;

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    const rates: Record<string, Record<string, number>> = {
      USD: { KES: 150, NGN: 1600 },
      KES: { USD: 1/150, NGN: 10.67 },
      NGN: { USD: 1/1600, KES: 1/10.67 },
    };

    if (fromCurrency === toCurrency) return amount;
    return Math.round(amount * rates[fromCurrency][toCurrency] * 100) / 100;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!fromAccount || !toAccount || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    if (fromAccount === toAccount) {
      toast({
        title: "Invalid Transfer",
        description: "Cannot transfer to the same account.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const success = onTransfer(fromAccount, toAccount, amountNum, note || undefined);
    
    if (success) {
      toast({
        title: "Transfer Successful",
        description: `${selectedFromAccount?.currency} ${amountNum.toLocaleString()} transferred successfully.`,
      });
      
      // Reset form
      setFromAccount("");
      setToAccount("");
      setAmount("");
      setNote("");
      onClose();
    } else {
      toast({
        title: "Transfer Failed",
        description: "Insufficient balance or invalid accounts.",
        variant: "destructive",
      });
    }

    setIsProcessing(false);
  };

  const getConversionInfo = () => {
    if (!selectedFromAccount || !selectedToAccount || !amountNum) return null;
    
    if (selectedFromAccount.currency !== selectedToAccount.currency) {
      const convertedAmount = convertCurrency(amountNum, selectedFromAccount.currency, selectedToAccount.currency);
      return {
        convertedAmount,
        rate: convertedAmount / amountNum,
      };
    }
    return null;
  };

  const conversionInfo = getConversionInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600" />
            New Transfer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="from-account">From Account</Label>
            <Select value={fromAccount} onValueChange={setFromAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} - {account.currency} {account.balance.toLocaleString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-account">To Account</Label>
            <Select value={toAccount} onValueChange={setToAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination account" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  .filter(account => account.id !== fromAccount)
                  .map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} - {account.currency} {account.balance.toLocaleString()}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
            {selectedFromAccount && amountNum > selectedFromAccount.balance && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Insufficient balance (Available: {selectedFromAccount.balance.toLocaleString()})
              </div>
            )}
          </div>

          {conversionInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-blue-800">Currency Conversion</p>
              <p className="text-sm text-blue-700">
                {selectedFromAccount?.currency} {amountNum.toLocaleString()} → {selectedToAccount?.currency} {conversionInfo.convertedAmount.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600">
                Rate: 1 {selectedFromAccount?.currency} = {conversionInfo.rate.toFixed(4)} {selectedToAccount?.currency}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this transfer..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessing || !fromAccount || !toAccount || !amount || amountNum <= 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Processing..." : "Transfer Funds"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
