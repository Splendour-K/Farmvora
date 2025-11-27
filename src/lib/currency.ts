// Currency utility functions

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  NGN: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Naira',
    flag: '🇳🇬'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸'
  },
  GHS: {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghanaian Cedi',
    flag: '🇬🇭'
  },
  KES: {
    code: 'KES',
    symbol: 'KSh',
    name: 'Kenyan Shilling',
    flag: '🇰🇪'
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    flag: '🇿🇦'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    flag: '🇪🇺'
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    flag: '🇬🇧'
  }
};

/**
 * Format amount with currency symbol
 */
export function formatCurrency(amount: number, currencyCode: string = 'NGN'): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.NGN;
  
  // Format number with commas
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  // For KSh, put symbol before amount (e.g., KSh 1,000.00)
  if (currencyCode === 'KES') {
    return `${currency.symbol} ${formattedAmount}`;
  }
  
  // For others, put symbol before amount (e.g., $1,000.00, ₦1,000.00)
  return `${currency.symbol}${formattedAmount}`;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string = 'NGN'): string {
  return CURRENCIES[currencyCode]?.symbol || '₦';
}

/**
 * Get currency name
 */
export function getCurrencyName(currencyCode: string = 'NGN'): string {
  return CURRENCIES[currencyCode]?.name || 'Nigerian Naira';
}

/**
 * Calculate ROI amount
 */
export function calculateROI(principal: number, roiPercentage: number): number {
  return (principal * roiPercentage) / 100;
}

/**
 * Calculate total return (principal + ROI)
 */
export function calculateTotalReturn(principal: number, roiPercentage: number): number {
  return principal + calculateROI(principal, roiPercentage);
}

/**
 * Format currency with code (e.g., "₦1,000.00 NGN")
 */
export function formatCurrencyWithCode(amount: number, currencyCode: string = 'NGN'): string {
  return `${formatCurrency(amount, currencyCode)} ${currencyCode}`;
}
