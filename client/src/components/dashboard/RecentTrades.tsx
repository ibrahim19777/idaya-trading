import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { Trade } from '@shared/schema';

export function RecentTrades() {
  const { user } = useAuth();
  
  const { data: trades = [], isLoading } = useQuery<Trade[]>({
    queryKey: ['/api/trades', user?.id],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>آخر الصفقات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 h-16 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentTrades = trades.slice(0, 5);

  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>آخر الصفقات</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTrades.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              لا توجد صفقات حتى الآن
            </p>
          ) : (
            recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    parseFloat(trade.profit || '0') >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {parseFloat(trade.profit || '0') >= 0 ? (
                      <ArrowUp className="h-4 w-4 text-white" />
                    ) : (
                      <ArrowDown className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{trade.pair}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{trade.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${
                    parseFloat(trade.profit || '0') >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {parseFloat(trade.profit || '0') >= 0 ? '+' : ''}${trade.profit}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(trade.executedAt!).toLocaleTimeString('ar')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
