
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
  isReversed?: boolean;
  reversalOfTransaction?: string;
}
