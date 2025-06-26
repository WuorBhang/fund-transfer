
import { Account } from "@/types/treasury";

export const INITIAL_ACCOUNTS: Account[] = [
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
