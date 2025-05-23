import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface CalculationResult {
  finalCapital: number;
  totalProfit: number;
  monthlyReturn: number;
  annualReturn: number;
  monthlyBreakdown: Array<{ month: number; capital: number }>;
}

const strategies = {
  'low-risk': { min: 0.05, max: 0.15, name: 'مخاطرة منخفضة (5-15% شهرياً)' },
  'medium-risk': { min: 0.15, max: 0.30, name: 'مخاطرة متوسطة (15-30% شهرياً)' },
  'high-risk': { min: 0.30, max: 0.50, name: 'مخاطرة عالية (30%+ شهرياً)' },
  'islamic': { min: 0.10, max: 0.20, name: 'استراتيجية إسلامية (10-20% شهرياً)' },
};

export function ProfitCalculator() {
  const [initialCapital, setInitialCapital] = useState(1000);
  const [strategy, setStrategy] = useState<keyof typeof strategies>('medium-risk');
  const [timeframe, setTimeframe] = useState(12);
  const [reinvestment, setReinvestment] = useState(50);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateProfit = () => {
    const strategyData = strategies[strategy];
    const avgReturn = (strategyData.min + strategyData.max) / 2;
    const reinvestRate = reinvestment / 100;
    
    let currentCapital = initialCapital;
    let totalProfit = 0;
    const monthlyBreakdown: Array<{ month: number; capital: number }> = [];
    
    for (let month = 1; month <= timeframe; month++) {
      const monthlyProfit = currentCapital * avgReturn;
      totalProfit += monthlyProfit;
      
      // Reinvest portion of profit
      const reinvestedAmount = monthlyProfit * reinvestRate;
      currentCapital += reinvestedAmount;
      
      monthlyBreakdown.push({ month, capital: currentCapital });
    }
    
    const finalCapital = initialCapital + totalProfit;
    const annualReturn = ((finalCapital / initialCapital - 1) * (12 / timeframe)) * 100;
    
    setResult({
      finalCapital,
      totalProfit,
      monthlyReturn: avgReturn * 100,
      annualReturn,
      monthlyBreakdown: monthlyBreakdown.slice(0, 6), // Show first 6 months
    });
  };

  useEffect(() => {
    calculateProfit();
  }, [initialCapital, strategy, timeframe, reinvestment]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calculator Form */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>المعطيات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="capital">رأس المال الأولي ($)</Label>
            <Input
              id="capital"
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="strategy">الاستراتيجية</Label>
            <NativeSelect
              value={strategy}
              onValueChange={(value: keyof typeof strategies) => setStrategy(value)}
              className="mt-1"
              options={Object.entries(strategies).map(([key, data]) => ({
                value: key,
                label: data.name
              }))}
            />
          </div>
          
          <div>
            <Label htmlFor="timeframe">فترة الاستثمار (شهور)</Label>
            <Input
              id="timeframe"
              type="number"
              value={timeframe}
              onChange={(e) => setTimeframe(Number(e.target.value))}
              className="mt-1"
              min="1"
              max="60"
            />
          </div>
          
          <div>
            <Label htmlFor="reinvestment">نسبة إعادة الاستثمار (%)</Label>
            <Input
              id="reinvestment"
              type="number"
              value={reinvestment}
              onChange={(e) => setReinvestment(Number(e.target.value))}
              className="mt-1"
              min="0"
              max="100"
            />
          </div>
          
          <Button onClick={calculateProfit} className="w-full">
            احسب الأرباح
          </Button>
        </CardContent>
      </Card>
      
      {/* Results */}
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle>النتائج المتوقعة</CardTitle>
        </CardHeader>
        <CardContent>
          {result && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">رأس المال النهائي</p>
                  <p className="text-2xl font-bold text-primary">
                    ${result.finalCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي الأرباح</p>
                  <p className="text-2xl font-bold text-green-500">
                    ${result.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">العائد الشهري المتوسط</p>
                  <p className="text-xl font-bold">{result.monthlyReturn.toFixed(1)}%</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">العائد السنوي</p>
                  <p className="text-xl font-bold">{result.annualReturn.toFixed(2)}%</p>
                </div>
              </div>
              
              {/* Monthly Breakdown */}
              <div>
                <h4 className="font-semibold mb-3">التفصيل الشهري</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.monthlyBreakdown.map((month) => (
                    <div key={month.month} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        الشهر {month.month}
                      </span>
                      <span className="font-medium">
                        ${month.capital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                  <strong>تنبيه هام:</strong> هذه توقعات تقريبية بناء على الأداء التاريخي. 
                  النتائج الفعلية قد تختلف حسب ظروف السوق.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
