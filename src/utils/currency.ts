
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
  // Static exchange rates for demo purposes
  const rates: Record<string, Record<string, number>> = {
    USD: { KES: 150, NGN: 1600 },
    KES: { USD: 1/150, NGN: 10.67 },
    NGN: { USD: 1/1600, KES: 1/10.67 },
  };

  if (fromCurrency === toCurrency) return amount;
  return Math.round(amount * rates[fromCurrency][toCurrency] * 100) / 100;
};
