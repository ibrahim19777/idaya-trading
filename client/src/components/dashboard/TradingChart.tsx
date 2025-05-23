import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TradingChart() {
  return (
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle>أداء التداول</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            مخطط الأداء - يتطلب مكتبة Chart.js
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
