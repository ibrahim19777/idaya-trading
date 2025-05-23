import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NativeSelect } from '@/components/ui/native-select';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { Trade } from '@shared/schema';

export function TradesHistory() {
  const [platformFilter, setPlatformFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('7days');
  const [resultFilter, setResultFilter] = useState('all');
  const { user } = useAuth();

  const { data: trades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ['/api/trades', user?.id],
    enabled: !!user?.id,
  });

  const filteredTrades = trades.filter(trade => {
    if (platformFilter !== 'all' && trade.platform !== platformFilter) return false;
    if (resultFilter === 'profit' && parseFloat(trade.profit || '0') <= 0) return false;
    if (resultFilter === 'loss' && parseFloat(trade.profit || '0') >= 0) return false;
    return true;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-20 rounded-lg" />
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-96 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <NativeSelect
              value={platformFilter}
              onValueChange={setPlatformFilter}
              className="w-48"
              options={[
                { value: "all", label: "جميع المنصات" },
                { value: "binance", label: "Binance" },
                { value: "mt5", label: "MT5" },
                { value: "bybit", label: "Bybit" },
                { value: "kucoin", label: "KuCoin" },
                { value: "okx", label: "OKX" },
                { value: "coinbase", label: "Coinbase Pro" }
              ]}
            />
            
            <NativeSelect
              value={periodFilter}
              onValueChange={setPeriodFilter}
              className="w-48"
              options={[
                { value: "7days", label: "آخر 7 أيام" },
                { value: "30days", label: "آخر 30 يوم" },
                { value: "3months", label: "آخر 3 أشهر" }
              ]}
            />
            
            <NativeSelect
              value={resultFilter}
              onValueChange={setResultFilter}
              className="w-48"
              options={[
                { value: "all", label: "جميع النتائج" },
                { value: "profit", label: "صفقات رابحة" },
                { value: "loss", label: "صفقات خاسرة" }
              ]}
            />
            
            <Button variant="outline">
              تطبيق
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>سجل الصفقات ({filteredTrades.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTrades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">لا توجد صفقات تطابق المعايير المحددة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      المنصة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الزوج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      النوع
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الكمية
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      سعر الدخول
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      سعر الخروج
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الربح/الخسارة
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTrades.map((trade) => (
                    <tr key={trade.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {new Date(trade.executedAt!).toLocaleString('ar')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant="outline"
                          className={
                            trade.platform === 'binance' ? 'border-yellow-500 text-yellow-700' :
                            trade.platform === 'mt5' ? 'border-blue-500 text-blue-700' :
                            'border-orange-500 text-orange-700'
                          }
                        >
                          {trade.platform.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {trade.pair}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={trade.type === 'buy' ? 'default' : 'destructive'}>
                          {trade.type === 'buy' ? 'شراء' : 'بيع'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {trade.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        ${trade.entryPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        ${trade.exitPrice}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-medium ${
                          parseFloat(trade.profit || '0') >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {parseFloat(trade.profit || '0') >= 0 ? '+' : ''}${trade.profit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
