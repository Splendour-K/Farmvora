import { DollarSign } from 'lucide-react';
import { formatCurrency, getCurrencySymbol } from '../../lib/currency';

interface CurrencyTotals {
  [currency: string]: {
    totalInvested: number;
    totalReturns: number;
    investmentCount: number;
  };
}

interface CurrencyBreakdownProps {
  investments: Array<{
    amount: number;
    expected_return: number;
    status: string;
    project: {
      currency: string;
    };
  }>;
  title?: string;
  showOnlyApproved?: boolean;
}

export function CurrencyBreakdown({ investments, title = "Investment Breakdown by Currency", showOnlyApproved = false }: CurrencyBreakdownProps) {
  // Filter investments if needed
  const filteredInvestments = showOnlyApproved 
    ? investments.filter(inv => inv.status === 'approved')
    : investments;

  // Calculate totals per currency
  const currencyTotals: CurrencyTotals = filteredInvestments.reduce((acc, inv) => {
    const currency = inv.project.currency || 'NGN';
    
    if (!acc[currency]) {
      acc[currency] = {
        totalInvested: 0,
        totalReturns: 0,
        investmentCount: 0,
      };
    }
    
    acc[currency].totalInvested += inv.amount;
    acc[currency].totalReturns += inv.expected_return;
    acc[currency].investmentCount += 1;
    
    return acc;
  }, {} as CurrencyTotals);

  const currencies = Object.keys(currencyTotals).sort();

  if (currencies.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="space-y-4">
        {currencies.map((currency) => {
          const data = currencyTotals[currency];
          const profit = data.totalReturns - data.totalInvested;
          
          return (
            <div key={currency} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-gray-900">{currency}</span>
                  <span className="text-sm text-gray-500">({getCurrencySymbol(currency)})</span>
                </div>
                <span className="text-sm text-gray-600">{data.investmentCount} investment{data.investmentCount !== 1 ? 's' : ''}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Invested</p>
                  <p className="font-semibold text-gray-900">{formatCurrency(data.totalInvested, currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expected Returns</p>
                  <p className="font-semibold text-green-600">{formatCurrency(data.totalReturns, currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Profit</p>
                  <p className={`font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(profit, currency)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {currencies.length > 1 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> You have investments in {currencies.length} different currencies. 
            Each currency operates independently and returns are paid in the same currency you invested.
          </p>
        </div>
      )}
    </div>
  );
}
